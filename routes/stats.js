const express = require("express");
const Query = require("../pg");

var router = express.Router();

router.get("/", function (request, response, next) {
  Query({
    name: "Statistics ",
    text: "with t1 as (\
              select count(*) objects \
              from fgs_objects\
          ), t2 as (\
              select count(*) models \
              from fgs_models\
          ), t3 as (\
              select count(*) authors \
              from fgs_authors\
          ), t4 as (\
              select count(*) navaids \
              from fgs_navaids\
          ), t5 as (\
              select count(*) pends \
              from fgs_position_requests\
          ), t6 as (\
              select count(*) gndelevs \
              from fgs_objects \
              where ob_gndelev=-9999\
          ) \
          select objects, models, authors, navaids, pends, gndelevs \
          from t1, t2, t3, t4, t5, t6",
    values: [],
  })
    .then((result) => {
      var row = result.rows.length ? result.rows[0] : {};

      response.json({
        stats: {
          objects: row.objects || 0,
          models: row.models || 0,
          authors: row.authors || 0,
          navaids: row.navaids || 0,
          pending: row.pends || 0,
          elev: row.gndelevs || 0,
        },
      });
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

router.get("/all", function (request, response, next) {
  Query({
    name: "StatisticsAll",
    text: "SELECT * from fgs_statistics ORDER BY st_date",
    values: [],
  })
    .then((result) => {
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
      response.json(reply);
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

router.get("/models/byauthor/:limit?/:offset?/:days?", function (request, response, next) {
  var offset = Number(request.params.offset || 0);
  var limit = Number(request.params.limit || 100);
  var days = Number(request.params.days || 0);

  var QueryArgs = days > 0
    ? {
        name: "StatisticsModelsByAuthorAndRange",
        text: "SELECT COUNT(mo_id) AS count, au_name,au_id \
              FROM fgs_models, fgs_authors \
              WHERE mo_author = au_id and mo_modified > now()::date - (interval '1 days' * $3) \
              GROUP BY au_id \
              ORDER BY count DESC \
              limit $1 offset $2 ",
        values: [limit, offset, days],
      }
    : {
        name: "StatisticsModelsByAuthor",
        text: "SELECT COUNT(mo_id) AS count, au_name,au_id \
              FROM fgs_models, fgs_authors \
              WHERE mo_author = au_id \
              GROUP BY au_id \
              ORDER BY count DESC \
              limit $1 offset $2 ",
        values: [limit, offset],
      };

  Query(QueryArgs)
    .then((result) => {
      var reply = { modelsbyauthor: [] };
      result.rows.forEach(function (row) {
        reply.modelsbyauthor.push({
          author: row.au_name.trim(),
          author_id: Number(row.au_id),
          count: Number(row.count),
        });
      });
      response.json(reply);
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

router.get("/models/bycountry", function (request, response, next) {
  Query({
    name: "StatisticsModelsByCountry",
    text: "SELECT trim(co_name) as co_name, \
                  co_three, \
                  COUNT(ob_id) AS count, \
                  COUNT(ob_id)/(SELECT shape_sqm/10000000000 FROM gadm2_meta WHERE iso ILIKE co_three) AS density \
            FROM fgs_objects \
            INNER JOIN fgs_countries ON ob_country = co_code \
            WHERE co_three IS NOT NULL \
            GROUP BY co_code \
            HAVING COUNT(ob_id)/(SELECT shape_sqm FROM gadm2_meta WHERE iso ILIKE co_three) > 0 \
            ORDER BY count DESC",
          })
    .then((result) => {
      response.json({
        modelsbycountry: result.rows.map(rowToModelsByCountry),
      });
    })
    .catch((err) => {
      console.error('database error', err)
      return response.status(500).send("Database Error");
    });
});

function rowToModelsByCountry(row) {
  return {
    id: row.co_three.trim(),
    name: row.co_name.trim(),
    count: Number(row.count),
    density: Number(row.density || 0),
  };
}

module.exports = router;
