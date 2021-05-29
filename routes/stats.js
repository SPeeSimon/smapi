const express = require("express");
const Query = require("../pg");
const tar = require("tar");
const streamBuffers = require("stream-buffers");
const etag = require("etag");
const zlib = require("zlib");
const util = require("util");

var router = express.Router();

function toNumber(x) {
  var n = Number(x || 0);
  return isNaN(n) ? 0 : n;
}

router.get("/", function (req, res, next) {
  Query(
    {
      name: "Statistics ",
      text: "with t1 as (select count(*) objects from fgs_objects), t2 as (select count(*) models from fgs_models), t3 as (select count(*) authors from fgs_authors), t4 as (select count(*) navaids from fgs_navaids), t5 as (select count(*) pends from fgs_position_requests), t6 as (select count(*) gndelevs from fgs_objects where ob_gndelev=-9999) select objects, models, authors, navaids, pends, gndelevs from t1, t2, t3, t4, t5, t6",
      values: [],
    },
    function (err, result) {
      if (err) {
        return res.status(500).send("Database Error");
      }

      var row = result.rows.length ? result.rows[0] : {};

      res.json({
        stats: {
          objects: row.objects || 0,
          models: row.models || 0,
          authors: row.authors || 0,
          navaids: row.navaids || 0,
          pending: row.pends || 0,
          elev: row.gndelevs || 0,
        },
      });
    }
  );
});

router.get("/all", function (req, res, next) {
  Query(
    {
      name: "StatisticsAll",
      text: "SELECT * from fgs_statistics ORDER BY st_date",
      values: [],
    },
    function (err, result) {
      if (err) return res.status(500).send("Database Error");
      var reply = { statistics: [] };
      result.rows.forEach(function (row) {
        reply.statistics.push({
          date: row.st_date,
          objects: row.st_objects,
          models: row.st_models,
          authors: row.st_authors,
          signs: row.st_signs,
          navaids: row.st_navaids,
        });
      });
      res.json(reply);
    }
  );
});

router.get("/models/byauthor/:limit?/:offset?/:days?", function (req, res, next) {
  var offset = Number(req.params.offset || 0);
  var limit = Number(req.params.limit || 100);
  var days = Number(req.params.days || 0);

  var QueryArgs = req.params.days
    ? {
        name: "StatisticsModelsByAuthorAndRange",
        text: "SELECT COUNT(mo_id) AS count, au_name,au_id FROM fgs_models, fgs_authors WHERE mo_author = au_id and mo_modified > now()::date - interval '90 days' GROUP BY au_id ORDER BY count DESC limit $1 offset $2 ",
        values: [limit, offset],
      }
    : {
        name: "StatisticsModelsByAuthor",
        text: "SELECT COUNT(mo_id) AS count, au_name,au_id FROM fgs_models, fgs_authors WHERE mo_author = au_id GROUP BY au_id ORDER BY count DESC limit $1 offset $2 ",
        values: [limit, offset],
      };

  Query(QueryArgs, function (err, result) {
    if (err) return res.status(500).send("Database Error");
    var reply = { modelsbyauthor: [] };
    result.rows.forEach(function (row) {
      reply.modelsbyauthor.push({
        author: row.au_name.trim(),
        author_id: Number(row.au_id),
        count: Number(row.count),
      });
    });
    res.json(reply);
  });
});

router.get("/models/bycountry", function (req, res, next) {
  Query(
    {
      name: "StatisticsModelsByCountry",
      text: "SELECT COUNT(ob_id) AS count, COUNT(ob_id)/(SELECT shape_sqm/10000000000 FROM gadm2_meta WHERE iso ILIKE co_three) AS density, co_name, co_three FROM fgs_objects, fgs_countries WHERE ob_country = co_code AND co_three IS NOT NULL GROUP BY co_code HAVING COUNT(ob_id)/(SELECT shape_sqm FROM gadm2_meta WHERE iso ILIKE co_three) > 0 ORDER BY count DESC",
      values: [],
    },
    function (err, result) {
      if (err) return res.status(500).send("Database Error");
      var reply = { modelsbycountry: [] };

      result.rows.forEach(function (row) {
        reply.modelsbycountry.push({
          name: row.co_name.trim(),
          id: row.co_three.trim(),
          density: Number(row.density),
          count: Number(row.count),
        });
      });
      res.json(reply);
    }
  );
});

module.exports = router;
