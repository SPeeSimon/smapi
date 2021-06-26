const express = require("express");
const Query = require("../pg");
const {isNumber, isString, toNumber} = require("../utils/validations");
const { buildCheckFunction, validationResult, matchedData } = require('express-validator');
const checkBodyAndQuery = buildCheckFunction(['body', 'query']);

var router = express.Router();


function hasAuthorisation(request, response, next) {
  if (true) {
    return response.status(401).send("Unauthorized");
  }
  next();
}


function rowtoAuthor(row) {
  if (row.au_notes == null) {
    return {
      id: row.au_id,
      name: row.au_name,
      models: row.count,
    };
  }
  return {
    id: row.au_id,
    name: row.au_name,
    notes: row.au_notes || "",
    models: row.count,
  };
}

router.get("/list/:limit?/:offset?", function (request, response, next) {
  var offset = Number(request.params.offset || 0);
  var limit = Number(request.params.limit || 0);

  if (isNaN(offset) || isNaN(limit)) {
    return response.status(500).send("Invalid Request");
  }

  limit = Math.min(10000, Math.max(1, limit));

  Query({
    name: "AuthorsList",
    text: "select au_id, au_name, au_notes, coalesce(models_for_author, 0) as count \
          from fgs_authors \
          left join (\
            select mo_author, count(mo_id) models_for_author \
            from fgs_models \
            group by mo_author\
          ) model_count on au_id=mo_author \
          order by au_name asc \
          limit $1 offset $2",
    values: [limit, offset],
  })
    .then((result) => {
      if (result.rows.length === 0) {
        return response.status(404).send("No authors found");
      }
      const json = result.rows.map(rowtoAuthor);
      response.json(json);
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

router.get("/:id", function (request, response, next) {
  var id = toNumber(request.params.id);
  if (isNaN(request.params.id)) {
    return response.status(500).send("Invalid Request");
  }

  console.log("Check auth", request.get("Authorization"));

  Query({
    name: "AuthorById",
    text: "select au_id, au_name, au_notes, coalesce(models_for_author, 0) as count \
          from fgs_authors \
          left join (\
            select mo_author, count(mo_id) models_for_author \
            from fgs_models \
            group by mo_author\
          ) model_count on au_id=mo_author \
          where au_id = $1",
    values: [id],
  })
    .then((result) => {
      if (0 == result.rows.length) {
        return response.status(404).send("author not found");
      }
      response.json(rowtoAuthor(result.rows[0]));
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});


router.post("/", [hasAuthorisation,
  checkBodyAndQuery('name').isString().notEmpty(),
  checkBodyAndQuery('email').isEmail(),
], function (request, response, next) {
  // insert new author
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }

  const data = matchedData(request);
  const name = data.name;
  const email = data.email;

  Query({
    name: "Insert Author",
    text: "INSERT INTO fgs_authors(au_id, au_name, au_email) VALUES (DEFAULT, $1, $2) RETURNING au_id",
    values: [name, email],
  })
    .then((result) => {
      if (0 == result.rows.length) {
        return response.status(412).send("author not created");
      }
      response.status(201).set({
        'Location': `/author/${result.rows[0].au_id}`
      }).json(rowtoAuthor(
        Object.assign({}, { au_notes: null, count: 0, au_name: name, }, result.rows[0])
      ));
    })
    .catch((err) => {
      console.log(err.severity, 'inserting author (', err.code, '):', err.detail)
      return response.status(500).send("Database Error");
    });
});

module.exports = router;

// get by email
"SELECT au_id, au_name, au_email, au_notes FROM fgs_authors WHERE au_email=$1"
