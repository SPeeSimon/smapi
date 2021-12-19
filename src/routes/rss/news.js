const express = require("express");
const {NewsPostDAO} = require("../../dao/NewsPostDAO");
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

  new NewsPostDAO().getLatestNewsPosts(10)
    .then((result) => {
      result.forEach((post) => {
        const url =  `${process.env.SCENERY_NEWS_URL}/${post.id}`;
        feed.addItem({
          id: url,
          link: url,
          date: post.timestamp,
          description: post.text,
          author: [
            {
              name: post.author.name,
              link: `${process.env.SCENERY_AUTHOR_URL}/${post.author.id}`,
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
