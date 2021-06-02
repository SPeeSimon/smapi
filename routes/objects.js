const express = require("express");
const Query = require("../pg");
const util = require("util");

var router = express.Router();

function toNumber(x) {
  var n = Number(x || 0);
  return isNaN(n) ? 0 : n;
}

function toFeatureCollection(rows) {
  return {
    type: "FeatureCollection",
    features: rows.map(rowToObjectFeature),
  };
}

function rowToObjectFeature(row) {
  return {
    type: "Feature",
    id: row["ob_id"],
    geometry: {
      type: "Point",
      coordinates: [row["ob_lon"], row["ob_lat"]],
    },
    properties: rowToObjectProperties(row),
  };
}

function rowToObjectProperties(row) {
  return Object.assign({
      id: row["ob_id"],
      title: row["ob_text"],
      heading: row["ob_heading"],
      gndelev: row["ob_gndelev"],
      elevoffset: row["ob_elevoffset"],
      model_id: row["ob_model"],
      model_name: row["mo_name"],
      stg: row["obpath"] + row["ob_tile"] + ".stg",
      country: row["ob_country"],
  }, rowToModelGroup(row));
}

function rowToModelGroup(row) {
  if( row["mg_name"] ) {
    return {
      modelgroup: {
        id: row["mg_id"],
        name: row["mg_name"],
        shared: row["mg_id"] === 0,
      },
      shared: row["mg_id"],
    };
  }
  return {};
}

router.get("/:id", function (request, response, next) {
  var id = Number(request.params.id);

  if (isNaN(id)) {
    return response.status(500).send("Invalid Request");
  }

  Query({
    name: "Select Objects",
    text: "SELECT ob_id, ob_text, ob_country, ob_model, ST_Y(wkb_geometry) AS ob_lat, ST_X(wkb_geometry) AS ob_lon, \
             ob_heading, ob_gndelev, ob_elevoffset, mo_shared, mg_id, mg_name, mo_name, \
             concat('Objects/', fn_SceneDir(wkb_geometry), '/', fn_SceneSubDir(wkb_geometry), '/') AS obpath, ob_tile \
             FROM fgs_objects \
             LEFT JOIN fgs_models on fgs_models.mo_id = fgs_objects.ob_model \
             LEFT JOIN fgs_modelgroups on fgs_models.mo_shared = fgs_modelgroups.mg_id \
             WHERE ob_id = $1",
    values: [id],
  })
    .then((result) => {
      if (0 == result.rows.length) {
        return response.status(404).send("object not found");
      }
      return response.json(rowToObjectFeature(result.rows[0]));
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

router.get("/list/:limit?/:offset?", function (request, response, next) {
  var offset = Number(request.params.offset || 0);
  var limit = Number(request.params.limit || 100);

  if (isNaN(offset) || isNaN(limit)) {
    return response.status(500).send("Invalid Request");
  }

  Query({
    name: "Select Objects",
    text: "SELECT ob_id, ob_text, ob_country, ob_model, ST_Y(wkb_geometry) AS ob_lat, ST_X(wkb_geometry) AS ob_lon, \
             ob_heading, ob_gndelev, ob_elevoffset, mo_shared, mg_id, mg_name, mo_name, \
             concat('Objects/', fn_SceneDir(wkb_geometry), '/', fn_SceneSubDir(wkb_geometry), '/') AS obpath, ob_tile \
             FROM fgs_objects \
             LEFT JOIN fgs_models on fgs_models.mo_id = fgs_objects.ob_model \
             LEFT JOIN fgs_modelgroups on fgs_models.mo_shared = fgs_modelgroups.mg_id \
             order by ob_modified desc \
             limit $1 offset $2",
    values: [limit, offset],
  })
    .then((result) => {
      return response.json(toFeatureCollection(result.rows));
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});


// router.get("/search", function (request, response, next) {
//   request.query.offset;
//   if(request.query.model){
//     // ob_model = ?
//   }
//   request.query.groupid;
//   // ob_group = ?
//   request.query.elevation;
//   // ob_gndelev > ?-25 and ob_gndelev < ?+25
//   request.query.elevoffset;
//   // ob_elevoffset > ?-25 and ob_elevoffset < ?+25
//   request.query.heading;
//   // ob_heading > ?-5 and ob_heading < ?+5
//   request.query.lat;
//   // CAST (ST_Y(wkb_geometry) AS text) like ?%
//   request.query.lon;
//   // CAST (ST_X(wkb_geometry) AS text) like ?%
//   request.query.country;
//   // ob_country = ?
//   request.query.description;
//   // ob_text like %?%

//   Query({
//     name: "Select Objects Within",
//     text: "SELECT ob_id, ob_text, ob_country, ob_model, ST_Y(wkb_geometry) AS ob_lat, ST_X(wkb_geometry) AS ob_lon, \
//             ob_heading, ob_gndelev, ob_elevoffset, mo_shared, mg_id, mg_name, mo_name, \
//             concat('Objects/', fn_SceneDir(wkb_geometry), '/', fn_SceneSubDir(wkb_geometry), '/') AS obpath, ob_tile \
//             FROM fgs_objects \
//             LEFT JOIN fgs_models on fgs_models.mo_id = fgs_objects.ob_model \
//             LEFT JOIN fgs_modelgroups on fgs_models.mo_shared = fgs_modelgroups.mg_id \
//             WHERE TODO \
//             LIMIT 400",
//     values: [
//       util.format("POLYGON((%d %d,%d %d,%d %d,%d %d,%d %d))", west, south, west, north, east, north, east, south, west, south),
//     ],
//   })
//     .then((result) => {
//       return response.json(toFeatureCollection(result.rows));
//     })
//     .catch((err) => {
//       return response.status(500).send("Database Error");
//     });
// });


router.get("/", function (request, response, next) {
  var east = toNumber(request.query.e);
  var west = toNumber(request.query.w);
  var north = toNumber(request.query.n);
  var south = toNumber(request.query.s);

  Query({
    name: "Select Objects Within",
    text: "SELECT ob_id, ob_text, ob_country, ob_model, ST_Y(wkb_geometry) AS ob_lat, ST_X(wkb_geometry) AS ob_lon, \
            ob_heading, ob_gndelev, ob_elevoffset, mo_shared, mg_id, mg_name, mo_name, \
            concat('Objects/', fn_SceneDir(wkb_geometry), '/', fn_SceneSubDir(wkb_geometry), '/') AS obpath, ob_tile \
            FROM fgs_objects \
            LEFT JOIN fgs_models on fgs_models.mo_id = fgs_objects.ob_model \
            LEFT JOIN fgs_modelgroups on fgs_models.mo_shared = fgs_modelgroups.mg_id \
            WHERE ST_Within(wkb_geometry, ST_GeomFromText($1,4326)) \
            LIMIT 400",
    values: [
      util.format("POLYGON((%d %d,%d %d,%d %d,%d %d,%d %d))", west, south, west, north, east, north, east, south, west, south),
    ],
  })
    .then((result) => {
      return response.json(toFeatureCollection(result.rows));
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

module.exports = router;
