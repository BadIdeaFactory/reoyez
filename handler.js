"use strict";

const fs = require("fs");
const fetch = require("isomorphic-unfetch");
const jsdom = require("jsdom");

const { JSDOM } = jsdom;
const DOMParser = new JSDOM().window.DOMParser;

const baseURL = "https://api.oyez.org/podcasts/oral-arguments/";

const previousTerms = 5;
const currentTerm = new Date().getFullYear();
const terms = [...Array(previousTerms).keys()]
  .map((i) => currentTerm - i)
  .sort();

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

module.exports.feed = async (event) => {
  const itemsByTerm = await Promise.all(terms.map(fetchTerm));
  const items = itemsByTerm.flat();

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/rss+xml",
    },
    body: `${header}
      ${items
        .map((item) => `<item>${removeiTunesOrder(item.innerHTML)}</item>`)
        .join("\n")}
    ${footer}`,
  };
};
