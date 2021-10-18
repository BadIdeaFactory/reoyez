"use strict";

const fs = require("fs");
const fetch = require("isomorphic-unfetch");
const jsdom = require("jsdom");

const { JSDOM } = jsdom;
const DOMParser = new JSDOM().window.DOMParser;

const baseURL = "https://api.oyez.org/podcasts/oral-arguments/";

const startTerm = 2020;
const currentTerm = new Date().getFullYear();
const terms = [...Array(currentTerm-startTerm+1).keys()].map((i) => startTerm + i);

const header = fs.readFileSync("./header.xml", "utf8");

async function fetchTerm(term) {
  const response = await fetch(`${baseURL}${term}`);
  const text = await response.text();
  const items = [
    ...await new DOMParser()
      .parseFromString(text, "text/xml")
      .querySelectorAll("item"),
  ];
  return items;
}

module.exports.feed = async (event) => {
  const itemsByTerm = await Promise.all(terms.map(fetchTerm));
  const items = itemsByTerm.flat();

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/xml",
    },
    body: `${header}
      ${items.map((item) => `<item>${item.innerHTML}</item>`)}
    </rss>
    `,
  };
};
