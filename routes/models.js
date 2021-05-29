const express = require("express");
const Query = require("../pg");
const tar = require("tar");
const util = require("util");

var router = express.Router();

function toNumber(x) {
  var n = Number(x || 0);
  return isNaN(n) ? 0 : n;
}

router.get("/bymg/:mg/:limit?/:offset?", function (req, res, next) {
  var mg = Number(req.params.mg || 0);
  var offset = Number(req.params.offset || 0);
  var limit = Number(req.params.limit || 0);

  if (isNaN(offset) || isNaN(limit) || isNaN(mg)) {
    return res.status(500).send("Invalid Request");
  }

  limit = Math.min(10000, Math.max(1, limit));

  Query(
    {
      name: "ModelsListByMg",
      text: "select mo_id, mo_path, mo_name, mo_notes, mo_shared, mo_modified,mo_author,au_name from fgs_models,fgs_authors where au_id=mo_author and mo_shared=$1 order by mo_modified desc limit $2 offset $3",
      values: [mg, limit, offset],
    },
    function (err, result) {
      if (err) {
        return res.status(500).send("Database Error");
      }

      var j = [];
      result.rows.forEach(function (row) {
        j.push({
          id: row.mo_id,
          filename: row.mo_path,
          name: row.mo_name,
          notes: row.mo_notes,
          shared: row.mo_shared,
          modified: row.mo_modified,
          author: row.au_name,
          authorId: row.mo_author,
        });
      });
      res.json(j);
    }
  );
});

router.get("/list/:limit?/:offset?", function (req, res, next) {
  var offset = Number(req.params.offset || 0);
  var limit = Number(req.params.limit || 0);

  if (isNaN(offset) || isNaN(limit)) {
    return res.status(500).send("Invalid Request");
  }

  limit = Math.min(10000, Math.max(1, limit));

  Query(
    {
      name: "ModelsList",
      text: "select mo_id, mo_path, mo_name, mo_notes, mo_shared, mo_modified,mo_author,au_name from fgs_models,fgs_authors where au_id=mo_author order by mo_modified desc limit $1 offset $2 ",
      values: [limit, offset],
    },
    function (err, result) {
      if (err) {
        return res.status(500).send("Database Error");
      }

      var j = [];
      result.rows.forEach(function (row) {
        j.push({
          id: row.mo_id,
          filename: row.mo_path,
          name: row.mo_name,
          notes: row.mo_notes,
          shared: row.mo_shared,
          modified: row.mo_modified,
          author: row.au_name,
          authorId: row.mo_author,
        });
      });
      res.json(j);
    }
  );
});

router.get("/datatable", function (req, res, next) {
  var draw = toNumber(req.query.draw);
  var start = toNumber(req.query.start);
  var length = toNumber(req.query.length);

  req.query.search = req.query.search || {};
  var search = req.query.search.value || "";

  order = req.query.order || [{ column: "1", dir: "asc" }];

  var order_cols = {
    1: "mo_id",
    2: "mo_name",
    3: "mo_path",
    4: "mo_notes",
    5: "mo_modified",
    6: "mo_shared",
  };
  order_col = order_cols[toNumber(order[0].column)] || "mo_id";
  order_dir = order[0].dir === "asc" ? "ASC" : "DESC";

  //TODO: need to construct prepared statements for each order/dir combination
  var queryArgs =
    //search == '' ?
    //    {
    //      name: 'ModelsListDatatable',
    //      text: "select mo_id, mo_path, mo_name, mo_notes, mo_modified, mo_shared from fgs_models order by mo_modified desc limit $1 offset $2",
    //      values: [ length, start ]
    //    } :
    {
      name: "ModelsSearchDatatable",
      text: "select mo_id, mo_path, mo_name, mo_notes, mo_modified, mo_shared from fgs_models where mo_path ilike $3 or mo_name ilike $3 or mo_notes ilike $3 order by mo_modified desc limit $1 offset $2",
      values: [length, start, "%" + search + "%"],
    };

  Query(queryArgs, function (err, result) {
    if (err) return res.status(500).send("Database Error");

    var j = [];
    result.rows.forEach(function (row) {
      j.push({
        id: row.mo_id,
        filename: row.mo_path,
        name: row.mo_name,
        notes: row.mo_notes,
        shared: row.mo_shared,
        modified: row.mo_modified,
      });
    });

    Query(
      {
        name: "CountModels",
        text: "select count(*) from fgs_models",
      },
      function (err, result) {
        if (err) return res.status(500).send("Database Error");

        var count = result.rows[0].count;

        res.json({
          draw: draw,
          recordsTotal: count,
          recordsFiltered: search == "" ? count : j.length,
          data: j,
        });
      }
    );
  });
});

router.get("/search/:pattern", function (req, res, next) {
  Query(
    {
      name: "ModelsSearch",
      text: "select mo_id, mo_path,mo_name,mo_notes,mo_shared,mo_modified from fgs_models where mo_path like $1 or mo_name like $1 or mo_notes like $1",
      values: ["%" + req.params.pattern + "%"],
    },
    function (err, result) {
      if (err) return res.status(500).send("Database Error");

      var j = [];
      result.rows.forEach(function (row) {
        j.push({
          id: row.mo_id,
          filename: row.mo_path,
          name: row.mo_name,
          notes: row.mo_notes,
          shared: row.mo_shared,
          modified: row.mo_modified,
        });
      });
      res.json(j);
    }
  );
});

router.get("/search/byauthor/:id/:limit?/:offset?", function (req, res, next) {
  var id = Number(req.params.id || 0);
  var offset = Number(req.params.offset || 0);
  var limit = Number(req.params.limit || 20);
  Query(
    {
      name: "ModelsSearchByAuthor",
      text: "select mo_id,mo_path,mo_name,mo_notes,mo_shared,mo_modified,mo_author,au_name from fgs_models,fgs_authors where au_id=mo_author and mo_author=$1 or mo_modified_by=$1 ORDER BY mo_modified DESC limit $2 offset $3",
      values: [id, limit, offset],
    },
    function (err, result) {
      if (err) return res.status(500).send("Database Error");

      var j = [];
      result.rows.forEach(function (row) {
        j.push({
          id: row.mo_id,
          filename: row.mo_path,
          name: row.mo_name,
          notes: row.mo_notes,
          shared: row.mo_shared,
          modified: row.mo_modified,
          author: row.au_name,
          authorId: row.mo_author,
        });
      });
      res.json(j);
    }
  );
});

module.exports = router;
