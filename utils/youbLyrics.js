/* (async () => {
  let tt = await getLyrics("34+35");
  console.log(tt);
})();*/

/**
 * @param {string} query Song query (can include artist)
 */
async function getLyrics(query) {
  const cheerio = require("cheerio");

  const url = `https://search.azlyrics.com/search.php?q=${query.split(/ +/g).join("+")}`;
  console.log(url);
  const response = await getUrl(url);
  let $ = cheerio.load(response.data);
  const links = $("td[class='text-left visitedlyr']").find("a");
  if (!links.length) return;
  const link = links.get(0).attribs.href;

  console.log(link);

  const lyricPage = await getUrl(link);
  $ = cheerio.load(lyricPage.data);
  const lyricDivs = $('div[class="col-xs-12 col-lg-8 text-center"]').find("div");

  const lyricss = [];
  lyricDivs.each((i, e) => {
    if (!$(e).attr("class")) lyricss.push($(e).text());
  });
  return lyricss.join("");
}

function getUrl(url) {
  return require("axios")
    .get(url)
    .then((response) => response)
    .catch((e) => console.log(e));
}

module.exports = getLyrics;
