const express = require("express");
const Query = require("../pg");

var router = express.Router();

router.get("/list/:limit?/:offset?", function (request, response, next) {
  var offset = Number(request.params.offset || 0);
  var limit = Number(request.params.limit || 10);

  if (isNaN(offset) || isNaN(limit)) {
    return response.status(500).send("Invalid Request");
  }

  Query({
    name: "NewsList",
    text: "SELECT ne_id, ne_timestamp, ne_author, au_name, ne_text \
           FROM public.fgs_news\
           LEFT JOIN fgs_authors on au_id=ne_author \
           ORDER BY ne_timestamp DESC \
           limit $1 offset $2",
    values: [limit, offset],
  })
    .then((result) => {
      return response.json(result.rows.map(rowToNewsItem));
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

router.get("/latest/:limit?", function (request, response, next) {
  var limit = Number(request.params.limit || 99);

  if (isNaN(limit)) {
    return response.status(500).send("Invalid Request");
  }

  Query({
    name: "LatestNewsList",
    text: "SELECT ne_id, ne_timestamp, ne_author, au_name, ne_text \
          FROM public.fgs_news \
          LEFT JOIN fgs_authors on au_id=ne_author \
          WHERE ne_timestamp > now() - interval '30 days' \
          ORDER BY ne_timestamp DESC \
          limit $1",
    values: [limit],
  })
    .then((result) => {
      return response.json(result.rows.map(rowToNewsItem));
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

router.get("/:id", function (request, response, next) {
  var id = Number(request.params.id || 0);
  if (isNaN(id)) {
    return response.status(500).send("Invalid Request");
  }

  Query({
    name: "NewsItem",
    text: "SELECT ne_id, ne_timestamp, ne_author, au_name, ne_text \
            FROM public.fgs_news \
            LEFT JOIN fgs_authors on au_id=ne_author \
            WHERE ne_id = $1",
    values: [id],
  })
    .then((result) => {
      if (0 == result.rows.length) {
        return response.status(404).send("newsitem not found");
      }

      response.json(rowToNewsItem(result.rows[0]));
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
