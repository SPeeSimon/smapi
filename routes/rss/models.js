const express = require("express");
const Query = require("../../pg");
const Feed = require("feed").Feed;

var router = express.Router();

function toNumber(x) {
  var n = Number(x || 0);
  return isNaN(n) ? 0 : n;
}

router.get("/", function (request, response, next) {
  const feed = new Feed({
    title: "FGFSDB Updates",
    link: "https://scenery.flightgear.org/#/models",
    language: "en-GB",
    copyright: "Jon Stockill 2006-2008.",
    description: "FlightGear scenery object database model additions.",
    ttl: 720,
    favicon: "https://scenery.flightgear.org/favicon.ico",
    generator: "FlightGear Scenery Models RSS",
  });

  Query({
    name: "ModelsList",
    text: "select mo_id, mo_path, mo_name, mo_notes, mo_shared, mo_modified,mo_author,au_name \
          from fgs_models,fgs_authors \
          where au_id=mo_author \
          order by mo_modified desc \
          limit $1 offset $2 ",
    values: [50, 0],
  })
    .then((result) => {
      result.rows.forEach((model) => {
        const url = "https://scenery.flightgear.org/#/model/" + model.mo_id;
        feed.addItem({
          id: url,
          link: url,
          title: model.mo_name,
          description: model.mo_name,
          author: [
            {
              name: model.au_name,
              link: "https://scenery.flightgear.org/#/author/" + model.mo_author,
            },
          ],
          date: model.mo_modified,
        });
      });

      response.set("Content-type", "application/rss+xml");
      response.send(feed.rss2());
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

function rowToModel(row) {
  return {
    id: row.mo_id,
    filename: row.mo_path,
    name: row.mo_name,
    notes: row.mo_notes,
    shared: row.mo_shared,
    modified: row.mo_modified,
  };
}

function rowToModelWithAuthor(row) {
  return Object.assign(rowToModel(row), {
    author: row.au_name,
    authorId: row.mo_author,
  });
}

module.exports = router;
