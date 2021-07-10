const express = require("express");
const {toNumber} = require("../utils/validations");
const { buildCheckFunction, validationResult, matchedData } = require('express-validator');
const { authenticatedRequestValidation } = require("./auth/AuthorizationToken");
const checkBodyAndQuery = buildCheckFunction(['body', 'query']);
const {AuthorDAO} = require('../dao/AuthorDAO');

var router = express.Router();


router.get("/list/:limit?/:offset?", function (request, response, next) {
  var offset = Number(request.params.offset || 0);
  var limit = Number(request.params.limit || 0);

  if (isNaN(offset) || isNaN(limit)) {
    return response.status(500).send("Invalid Request");
  }

  limit = Math.min(10000, Math.max(20, limit));
  new AuthorDAO().getAllAuthors(offset, limit)
    .then((result) => {
      if (result.length === 0) {
        return response.status(404).send("No authors found");
      }
      response.json(result);
    })
    .catch((err) => {
      console.log('error', err)
      return response.status(500).send("Database Error");
    });
});

router.get("/:id", function (request, response, next) {
  var id = toNumber(request.params.id);
  if (isNaN(request.params.id)) {
    return response.status(500).send("Invalid Request");
  }

  // console.log("Check auth", request.get("Authorization"));

  new AuthorDAO().getAuthor(id)
    .then((result) => {
      if (!result) {
        return response.status(404).send("author not found");
      }
      response.json(result);
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});


router.post("/", [authenticatedRequestValidation,
  checkBodyAndQuery('name').isString().notEmpty(),
  checkBodyAndQuery('email').isEmail(),
], function (request, response, next) {
  // insert new author
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }

  const data = matchedData(request);

  new AuthorDAO().addAuthor(data)
    .then((result) => {
      if (!result) {
        return response.status(412).send("author not created");
      }
      response.status(201).set({
        'Location': `/author/${result.rows[0].au_id}`
      }).json(result);
    })
    .catch((err) => {
      console.log(err.severity, 'inserting author (', err.code, '):', err.detail)
      return response.status(500).send("Database Error");
    });
});

module.exports = router;
