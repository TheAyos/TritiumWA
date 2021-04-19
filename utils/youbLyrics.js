/*(async () => {
  let tt = await getLyrics("34+35");
  console.log(tt);
})();*/

/**
 * @param {string} query Song query (can include artist)
 */
async function getLyrics(query) {
  const cheerio = require("cheerio");

  let url = `https://search.azlyrics.com/search.php?q=${query.split(/ +/g).join("+")}`;
  console.log(url);
  let response = await getUrl(url);
  let $ = cheerio.load(response.data);
  let links = $("td[class='text-left visitedlyr']").find("a");
  if (!links.length) return;
  let link = links.get(0).attribs.href;

  console.log(link);

  let lyricPage = await getUrl(link);
  $ = cheerio.load(lyricPage.data);
  let lyricDivs = $('div[class="col-xs-12 col-lg-8 text-center"]').find("div");

  let lyricss = [];
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
