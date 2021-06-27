const express = require("express");
const Query = require("../../dao/pg");
const Feed = require("feed").Feed;

var router = express.Router();


router.get("/", function (request, response, next) {
  const feed = new Feed({
    title: "FGFSDB Updates",
    link: `${process.env.SCENERY_NEWS_URL}`,
    language: "en-GB",
    copyright: "Jon Stockill 2006.",
    description: "FlightGear scenery object database updates.",
    ttl: 720,
    favicon: `${process.env.SCENERY_URL}/favicon.ico`,
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
        const url =  `${process.env.SCENERY_NEWS_URL}/${post.ne_id}`;
        feed.addItem({
          id: url,
          link: url,
          date: post.ne_timestamp,
          description: post.ne_text,
          author: [
            {
              name: post.au_name,
              link: `${process.env.SCENERY_AUTHOR_URL}/${post.ne_author}`,
            },
          ],
        });
      });

      response.set("Content-type", "application/rss+xml");
      response.send(feed.rss2());
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

module.exports = router;
