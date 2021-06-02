const express = require("express");
const Query = require("../../pg");
const Feed = require("feed").Feed;

var router = express.Router();

router.get("/", function (request, response, next) {
  const feed = new Feed({
    title: "FGFSDB Updates",
    link: "https://scenery.flightgear.org/",
    language: "en-GB",
    copyright: "Jon Stockill 2006.",
    description: "FlightGear scenery object database updates.",
    ttl: 720,
    favicon: "https://scenery.flightgear.org/favicon.ico",
    generator: "FlightGear Scenery News RSS",
  });

  Query({
    name: "LatestNewsList",
    text: "SELECT ne_id, ne_timestamp, ne_author, au_name, ne_text \
          FROM public.fgs_news \
          LEFT JOIN fgs_authors on au_id=ne_author \
          ORDER BY ne_timestamp DESC \
          limit $1",
    values: [10],
  })
    .then((result) => {
      result.rows.forEach((post) => {
        const url = "https://scenery.flightgear.org/#/news/" + post.ne_id;
        feed.addItem({
          id: url,
          link: url,
          description: post.ne_text,
          author: [
            {
              name: post.au_name,
              link: "https://scenery.flightgear.org/#/author/" + post.ne_author,
            },
          ],
          date: post.ne_timestamp,
        });
      });

      response.set("Content-type", "application/rss+xml");
      response.send(feed.rss2());
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

function rowToNewsItem(row) {
  return {
    id: row.ne_id,
    timestamp: row.ne_timestamp,
    author: {
      id: row.ne_author,
      name: row.au_name,
    },
    text: row.ne_text,
  };
}

module.exports = router;
