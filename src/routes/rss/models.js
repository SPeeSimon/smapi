const express = require("express");
const Query = require("../../dao/pg");
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

  Query({
    name: "LatestModelsList",
    text: "SELECT mo_id, mo_path, mo_name, mo_notes, mo_shared, mo_modified, mo_author, au_name \
          FROM fgs_models \
          INNER JOIN fgs_authors ON au_id=mo_author \
          ORDER BY mo_modified DESC \
          limit $1",
    values: [50],
  })
    .then((result) => {
      result.rows.forEach((model) => {
        const url = `${process.env.SCENERY_MODEL_URL}/${model.mo_id}`;
        feed.addItem({
          title: model.mo_name,
          id: url,
          link: url,
          date: model.mo_modified,
          description: model.mo_name,
          author: [
            {
              name: model.au_name,
              link: `${process.env.SCENERY_AUTHOR_URL}/${model.mo_author}`,
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
