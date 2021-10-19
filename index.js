const fs = require("fs");
const fetch = require("isomorphic-unfetch");
const jsdom = require("jsdom");

const { JSDOM } = jsdom;
const DOMParser = new JSDOM().window.DOMParser;

const baseURL = "https://api.oyez.org/podcasts/oral-arguments/";

const startTerm = 1955;
const currentTerm = new Date().getFullYear();
const terms = [...Array(currentTerm-startTerm+1).keys()]
  .map((i) => startTerm + i)
  .reverse();

const header = fs.readFileSync("./header.xml", "utf8");
const footer = fs.readFileSync("./footer.xml", "utf8");

async function fetchTerm(term) {
  const response = await fetch(`${baseURL}${term}`);
  const text = await response.text();
  const items = [
    ...(await new DOMParser()
      .parseFromString(text, "text/xml")
      .querySelectorAll("item")),
  ];
  return items;
}

function removeiTunesOrder(item) {
  return item.replace(/<itunes:order[^>]*>[0-9]+<\/itunes:order>/g, "");
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function assembleFeed(){
  let allItems = [];
  for (let term of terms) {
    console.log(`Fetching ${term}`);
    const items = await fetchTerm(term);
    allItems = allItems.concat(items);
    await sleep(2000);
  }

  return `${header}
      ${allItems
        .map((item) => `<item>${removeiTunesOrder(item.innerHTML)}</item>`)
        .join("\r\n")}
    ${footer}`;
}

async function writeFeed() {
  fs.writeFileSync("./dist/feed.xml", await assembleFeed());
}

writeFeed();
