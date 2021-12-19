const express = require("express");
const { ModelSearchQuery } = require("../../dao/ModelSearchQuery");
const { ModelDAO } = require("../../dao/ModelDAO");
const Feed = require("feed").Feed;

var router = express.Router();


router.get("/", function (request, response, next) {
  const feed = new Feed({
    title: "FGFSDB Updates",
    link: `${process.env.SCENERY_MODELS_URL}`,
    language: "en-GB",
    copyright: "Jon Stockill 2006-2008.",
    description: "FlightGear scenery object database model additions.",
    ttl: 720,
    favicon: `${process.env.SCENERY_URL}/favicon.ico`,
    generator: "FlightGear Scenery Models RSS",
  });

  new ModelDAO()
    .searchModel(new ModelSearchQuery().withOrder({column: 5, dir: 'DESC'}).withPaging(50, 0))
    .then((result) => {
      result.forEach((model) => {
        const url = `${process.env.SCENERY_MODEL_URL}/${model.metadata.id}`;
        feed.addItem({
          title: model.metadata.name,
          id: url,
          link: url,
          date: model.metadata.lastUpdated,
          description: model.metadata.name,
          author: [
            {
              name: model.metadata.author.name,
              email: 'noreply@flightgear.org', // model.metadata.author.email
              link: `${process.env.SCENERY_AUTHOR_URL}/${model.metadata.author.id}`,
            },
          ],
        });
      });

      response.set('Content-type', 'application/rss+xml');
      response.send(feed.rss2());
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});


module.exports = router;
