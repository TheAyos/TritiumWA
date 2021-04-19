const puppeteer = require("puppeteer");
const uaOverride = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36"; /* prettier-ignore*/

async function Frilycs(query) {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--disable-dev-shm-usage", "--no-referrers", "--disable-extensions", "--disable-notifications"],
  });

  const page = await browser.newPage();

  await page.setViewport({ width: 1034, height: 606 });

  await page.setUserAgent(uaOverride);

  await page.setRequestInterception(true);

  page.on("request", (request) => handleBlockedRequests(request));

  const genius = `https://genius.com/search?q=${encodeURIComponent(query)}`;

  console.log(genius);

  await Promise.all([page.goto(genius), page.waitForSelector("div.mini_card-info", { visible: true })]);

  console.log("Searching for songs...");

  const searchResults = await page.evaluate(() => {
    const result = [...document.querySelectorAll("div")]
      .find((el) => el.textContent === "Songs")
      .parentNode.querySelectorAll("mini-song-card");

    const songs = [];
    for (let i = 0; i < result.length; i++) {
      songs.push(result[i].childNodes[0].href);
    }

    // Go to song page
    [...document.querySelectorAll("div")]
      .find((el) => el.textContent === "Songs")
      .parentNode.querySelector("mini-song-card > a")
      .click();

    return songs;
  });

  console.log(searchResults);

  console.log("waiting....");

  await page.waitForNavigation({ waitUntil: ["load", "domcontentloaded", "networkidle0", "networkidle2"] });

  console.log("waiting....ENDED");

  console.log(`Using ${(await page.$$("lyrics > div > div > section > p")) ? "2nd" : "1st"} method`);

  // await autoScroll(page);

  const lyrics = await page.evaluate(() => {
    let lys;
    const lyricEl = [...document.querySelectorAll("div")].find((el) => el.className.startsWith("Ly"));

    if (lyricEl) {
      for (e of [...document.querySelectorAll("div")]
        .find((el) => el.className.startsWith("Ly"))
        .parentElement.querySelectorAll("div")) {
      }
      lys = lyricEl.parentNode.innerText;
    } else {
      lys = document.querySelector("lyrics > div > div > section > p").innerText;
    }

    return lys
      .trim()
      .replaceAll(/\[(.*?)\]/g, "")
      .replaceAll("\n\n", "\n")
      .trim();
  });

  const meta = await page.evaluate(() => {
    const meta = {};

    const coverEl = [...document.querySelectorAll("div")].find((el) => el.className.startsWith("SizedImage"));
    const coverElFallback = document.querySelector("img.cover_art-image");
    meta.coverImg = coverEl
      ? coverEl.innerHTML.replaceAll(/<[\/]?noscript>+/g, "").match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0]
      : coverElFallback
      ? coverElFallback.src
      : "";
    if (meta.coverImg.indexOf('"') > -1) meta.coverImg = meta.coverImg.slice(1, -1);

    const aboutEl = document.querySelector("#about")
      ? [...document.querySelector("#about").parentNode.querySelectorAll("div")].find((el) =>
          el.className.startsWith("RichText"),
        )
      : "";
    const aboutElFallback = document.querySelector("description-referent")
      ? [...document.querySelector("description-referent").querySelectorAll("div")].find(
          (el) => !el.className.includes("annotation"),
        )
      : "";
    meta.about = aboutEl ? aboutEl.innerText : aboutElFallback ? aboutElFallback.innerText : "";

    const albumEl = [...document.querySelectorAll("div")].find((e) =>
      e.className.includes("HeaderTracklist__Album"),
    );
    const albumElFallback = [...document.querySelectorAll("a")].find(
      (e) => e.getAttribute("ng-bind") === "album.name",
    );
    meta.albumName = albumEl
      ? albumEl.innerText.split(/[\n ]/).slice(-1).join("")
      : albumElFallback
      ? albumElFallback.innerText
      : "";

    return meta;
  });

  const titleMeta = (await page.title()).split("Lyrics")[0].trim().split(" – ");
  const metadata = { artist: titleMeta[0], song: titleMeta[1], link: searchResults[0], lyrics: lyrics };

  metadata.coverArtImgUrl = meta.coverImg;
  metadata.about = meta.about;
  metadata.album = meta.albumName;

  // console.log(metadata);

  // await new Promise((resolve) => setTimeout(resolve, 1e3 * 60 * 10));

  await page.close();
  await browser.close();

  return metadata;
}

module.exports = Frilycs;

// const browser = await puppeteer.connect({ browserWSEndpoint: "ws://0.0.0.0:8080" });
// await browser.disconnect();

function handleBlockedRequests(req) {
  const resType = req.resourceType();
  const resUrl = req.url();
  const blockedResTypes = ["font", "image", "stylessheet"];
  const blockedDomains = [
    "adsystem",
    "pubmatic",
    "taboola",
    "metrics",
    "musickit.js",
    "undertone",
    "video",
    "youtube",
    "facebook",
    "bugsnag",
    "quantcount",
    "googlesyndication",
    "twitter",
    "apple",
    "favicon",
    "gumgum",
    "google-analytics",
    "adnxs",
    "filepicker",
    "doubleclick",
    "adsafeprotected",
    "googleadservices",
    "googletagservices",
    "quant",
    "chartbeat",
    "casalemedia",
    "rubiconproject",
    "scorecardresearch",
    "3lift",
  ];
  if (blockedResTypes.includes(resType) || blockedDomains.some((u) => resUrl.includes(u))) req.abort();
  else req.continue();
}

async function autoScroll(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        let scrollTop = -1;
        const interval = setInterval(() => {
          window.scrollBy(0, 100);
          if (document.documentElement.scrollTop !== scrollTop) {
            scrollTop = document.documentElement.scrollTop;
            return;
          }
          clearInterval(interval);
          resolve();
        }, 10);
      }),
  );
}
