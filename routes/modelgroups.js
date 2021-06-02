const express = require("express");
const Query = require("../pg");

var router = express.Router();


function toNumber(x) {
  var n = Number(x || 0);
  return isNaN(n) ? 0 : n;
}


function rowToModelgroup(row) {
  return {
    id: Number(row.mg_id),
    name: row.mg_name,
    path: row.mg_path,
  };
}

router.get("/", function (request, response, next) {
  Query({
    name: "ModelgroupList",
    text: "select mg_id, mg_name, mg_path from fgs_modelgroups order by mg_id"
    })
    .then((result) => {
      response.json(result.rows.map(rowToModelgroup));
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

router.get("/:id", function (request, response, next) {
  Query({
    name: "ModelGroupsRead",
    text: "select mg_id, mg_name from fgs_modelgroups where mg_id = $1",
    values: [toNumber(request.params.id)],
  })
    .then((result) => {
      if (result.rows.length === 0) {
        return response.status(404).send("No modelgroup found");
      }
      response.json(rowToModelgroup(result.rows[0]));
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

module.exports = router;
