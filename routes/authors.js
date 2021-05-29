const express = require("express");
const Query = require("../pg");

var router = express.Router();

function toNumber(x) {
  var n = Number(x || 0);
  return isNaN(n) ? 0 : n;
}

router.get("/list/:limit?/:offset?", function (req, res, next) {
  var offset = Number(req.params.offset || 0);
  var limit = Number(req.params.limit || 0);

  if (isNaN(offset) || isNaN(limit)) {
    return res.status(500).send("Invalid Request");
  }

  limit = Math.min(10000, Math.max(1, limit));

  Query(
    {
      name: "AuthorsList",
      text: "select au_id, au_name, au_notes,count(mo_id) as count from fgs_authors,fgs_models where au_id=mo_author group by au_id order by au_name asc limit $1 offset $2 ",
      values: [limit, offset],
    },
    function (err, result) {
      if (err) {
        return res.status(500).send("Database Error");
      }

      var j = [];
      result.rows.forEach(function (row) {
        j.push({
          id: row.au_id,
          name: row.au_name,
          notes: row.au_notes,
          models: row.count,
        });
      });
      res.json(j);
    }
  );
});

router.get("/:id", function (req, res, next) {
  var id = toNumber(req.params.id);
  if (isNaN(req.params.id)) {
    return res.status(500).send("Invalid Request");
  } else {
    console.log("getting author", id);
  }

  console.log("Check auth", req.get("Authorization"));

  Query(
    {
      name: "AuthorBYId",
      text: "select au_id, au_name, au_notes, coalesce(models_for_author, 0) as count from fgs_authors left join (select mo_author, count(mo_id) models_for_author from fgs_models group by mo_author) model_count on au_id=mo_author where au_id = $1",
      values: [id],
    },
    function (err, result) {
      if (err) return res.status(500).send("Database Error");
      if (0 == result.rows.length) return res.status(404).send("author not found");

      var row = result.rows[0];
      res.json({
        id: row.au_id,
        name: row.au_name,
        notes: row.au_notes,
        models: row.count,
      });
    }
  );
});

module.exports = router;
