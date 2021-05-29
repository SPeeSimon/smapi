const express = require("express");
const Query = require("../pg");

var router = express.Router();

router.get("/:id?", function (req, res, next) {
  if (typeof req.params.id !== "undefined") {
    return res.status(404).send("not implemented");
  }

  Query(
    {
      name: "ModelgroupList",
      text: "select mg_id, mg_name, mg_path from fgs_modelgroups order by mg_id",
      values: [],
    },
    function (err, result) {
      if (err) return res.status(500).send("Database Error");
      var reply = [];

      result.rows.forEach(function (row) {
        reply.push({
          id: Number(row.mg_id),
          name: row.mg_name,
          path: row.mg_path,
        });
      });

      res.json(reply);
    }
  );
});

module.exports = router;
