const express = require("express");
const {NewsPostDAO} = require("../dao/NewsPostDAO");
const {toNumber} = require("../utils/validations");

const router = express.Router();


router.get("/list/:limit?/:offset?", function (request, response, next) {
  var offset = toNumber(request.params.offset);
  var limit = toNumber(request.params.limit);

  if (isNaN(offset) || isNaN(limit)) {
    return response.status(500).send("Invalid Request");
  }

  new NewsPostDAO().getNewsPosts(offset, limit)
    .then((result) => {
      return response.json(result);
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

  new NewsPostDAO().getLatestNewsPosts(limit)
    .then((result) => {
      return response.json(result);
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

  new NewsPostDAO().getNewsPost(id)
    .then((result) => {
      if (null == result) {
        return response.status(404).send("newsitem not found");
      }
      response.json(result);
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});


module.exports = router;
