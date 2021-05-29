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

function toFeatureCollection(rows) {
  var reply = {
    type: "FeatureCollection",
    features: [],
  };

  if (rows && Array.isArray(rows))
    rows.forEach(function (row) {
      reply.features.push({
        type: "Feature",
        id: row["ob_id"],
        geometry: {
          type: "Point",
          coordinates: [row["ob_lon"], row["ob_lat"]],
        },
        properties: {
          id: row["ob_id"],
          heading: row["ob_heading"],
          title: row["ob_text"],
          gndelev: row["ob_gndelev"],
          elevoffset: row["ob_elevoffset"],
          model_id: row["ob_model"],
          model_name: row["mo_name"],
          shared: row["mo_shared"],
          stg: row["obpath"] + row["ob_tile"] + ".stg",
          country: row["ob_country"],
        },
      });
    });
  return reply;
}

router.get("/:limit/:offset?", function (req, res, next) {
  var offset = Number(req.params.offset || 0);
  var limit = Number(req.params.limit || 100);

  if (isNaN(offset) || isNaN(limit)) {
    return res.status(500).send("Invalid Request");
  }

  Query(
    {
      name: "Select Objects",
      text: "SELECT ob_id, ob_text, ob_country, ob_model, ST_Y(wkb_geometry) AS ob_lat, ST_X(wkb_geometry) AS ob_lon, \
             ob_heading, ob_gndelev, ob_elevoffset, mo_shared, mo_name, \
             concat('Objects/', fn_SceneDir(wkb_geometry), '/', fn_SceneSubDir(wkb_geometry), '/') AS obpath, ob_tile \
             FROM fgs_objects, fgs_models WHERE fgs_models.mo_id = fgs_objects.ob_model order by ob_modified desc limit $1 offset $2",
      values: [limit, offset],
    },
    function (err, result) {
      if (err) {
        return res.status(500).send("Database Error");
      }
      return res.json(toFeatureCollection(result.rows));
    }
  );
});

router.get("/", function (req, res, next) {
  var east = toNumber(req.query.e);
  var west = toNumber(req.query.w);
  var north = toNumber(req.query.n);
  var south = toNumber(req.query.s);

  Query(
    {
      name: "Select Objects Within",
      text: "SELECT ob_id, ob_text, ob_country, ob_model, ST_Y(wkb_geometry) AS ob_lat, ST_X(wkb_geometry) AS ob_lon, \
            ob_heading, ob_gndelev, ob_elevoffset, mo_shared, mo_name, \
            concat('Objects/', fn_SceneDir(wkb_geometry), '/', fn_SceneSubDir(wkb_geometry), '/') AS obpath, ob_tile \
            FROM fgs_objects, fgs_models \
            WHERE ST_Within(wkb_geometry, ST_GeomFromText($1,4326)) \
            AND fgs_models.mo_id = fgs_objects.ob_model \
            LIMIT 400",
      values: [
        util.format("POLYGON((%d %d,%d %d,%d %d,%d %d,%d %d))", west, south, west, north, east, north, east, south, west, south),
      ],
    },
    function (err, result) {
      if (err) {
        return res.status(500).send("Database Error");
      }

      return res.json(toFeatureCollection(result.rows));
    }
  );
});

module.exports = router;
