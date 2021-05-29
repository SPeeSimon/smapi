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

var selectSignsWithinSql =
  "SELECT si_id, ST_Y(wkb_geometry) AS ob_lat, ST_X(wkb_geometry) AS ob_lon, \
           si_heading, si_gndelev, si_definition \
           FROM fgs_signs \
           WHERE ST_Within(wkb_geometry, ST_GeomFromText($1,4326)) \
           LIMIT 400";

var selectNavaidsWithinSql =
  "SELECT na_id, ST_Y(na_position) AS na_lat, ST_X(na_position) AS na_lon, \
           na_type, na_elevation, na_frequency, na_range, na_multiuse, na_ident, na_name, na_airport_id, na_runway \
           FROM fgs_navaids \
           WHERE ST_Within(na_position, ST_GeomFromText($1,4326)) \
           LIMIT 400";

router.get("/signs/", function (req, res, next) {
  var east = toNumber(req.query.e);
  var west = toNumber(req.query.w);
  var north = toNumber(req.query.n);
  var south = toNumber(req.query.s);

  Query(
    {
      name: "Select Signs Within",
      text: selectSignsWithinSql,
      values: [
        util.format("POLYGON((%d %d,%d %d,%d %d,%d %d,%d %d))", west, south, west, north, east, north, east, south, west, south),
      ],
    },
    function (err, result) {
      if (err) {
        return res.status(500).send("Database Error");
      }

      var features = [];
      if (result.rows)
        result.rows.forEach(function (row) {
          features.push({
            type: "Feature",
            id: row["si_id"],
            geometry: {
              type: "Point",
              coordinates: [row["ob_lon"], row["ob_lat"]],
            },
            properties: {
              id: row["si_id"],
              heading: row["si_heading"],
              definition: row["si_definition"],
              gndelev: row["si_gndelev"],
            },
          });
        });

      res.json({
        type: "FeatureCollection",
        features: features,
      });
    }
  );
});

router.get("/navaids/within/", function (req, res, next) {
  var east = toNumber(req.query.e);
  var west = toNumber(req.query.w);
  var north = toNumber(req.query.n);
  var south = toNumber(req.query.s);

  Query(
    {
      name: "Select Navaids Within",
      text: selectNavaidsWithinSql,
      values: [
        util.format("POLYGON((%d %d,%d %d,%d %d,%d %d,%d %d))", west, south, west, north, east, north, east, south, west, south),
      ],
    },
    function (err, result) {
      if (err) {
        return res.status(500).send("Database Error");
      }

      var features = [];
      if (result.rows)
        result.rows.forEach(function (row) {
          features.push({
            type: "Feature",
            id: row["si_id"],
            geometry: {
              type: "Point",
              coordinates: [row["na_lon"], row["na_lat"]],
            },
            properties: {
              id: row["na_id"],
              type: row["na_type"],
              elevation: row["na_elevation"],
              frequency: row["na_frequency"],
              range: row["na_range"],
              multiuse: row["na_multiuse"],
              ident: row["na_ident"],
              name: row["na_name"],
              airport: row["na_airport_id"],
              runway: row["na_runway"],
            },
          });
        });

      res.json({
        type: "FeatureCollection",
        features: features,
      });
    }
  );
});

router.get("/modelgroup/:id?", function (req, res, next) {
  var QueryArgs = req.params.id
    ? {
        name: "ModelGroupsRead",
        text: "select mg_id, mg_name from fgs_modelgroups where mg_id = $1",
        values: [toNumber(req.params.id)],
      }
    : {
        name: "ModelGroupsReadAll",
        text: "select mg_id, mg_name from fgs_modelgroups order by mg_id",
      };
  Query(QueryArgs, function (err, result) {
    if (err) {
      return res.status(500).send("Database Error");
    }

    var j = [];
    result.rows.forEach(function (row) {
      j.push({
        id: row.mg_id,
        name: row.mg_name,
      });
    });
    res.json(j);
  });
});

router.get("/navdb/airport/:icao", function (req, res, next) {
  if (!req.params.icao.match(/^[A-Za-z0-9]*$/)) {
    return res.json({});
  }
  Query(
    {
      name: "ModelsSearchByAuthor",
      //      text: "SELECT pr_id, pr_runways, pr_name, pr_type FROM fgs_procedures WHERE pr_airport = UPPER($1);",
      text: "select ST_AsGeoJSON(wkb_geometry) as rwy from apt_runway where icao=UPPER($1);",
      values: [req.params.icao],
    },
    function (err, result) {
      if (err) return res.status(500).send("Database Error");

      var j = {
        runwaysGeometry: {
          type: "GeometryCollection",
          geometries: [],
        },
        procedures: [],
      };
      result.rows.forEach(function (row) {
        j.runwaysGeometry.geometries.push(JSON.parse(row.rwy));
      });
      res.json(j);
    }
  );
});

module.exports = router;
