"use strict";
const express = require("express");
const Query = require("../dao/pg");
const util = require("util");
const auth = require("./auth");
const {isNumber, toNumber} = require("../utils/validations");
const { buildCheckFunction, validationResult, matchedData, param } = require('express-validator');
const { authenticatedRequestValidation } = require("./auth/AuthorizationToken");
const { ObjectSearchQuery } = require("../dao/ObjectSearchQuery");
const checkBodyAndQuery = buildCheckFunction(['body', 'query']);

var router = express.Router();


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
  return Object.assign(
    {
      id: row["ob_id"],
      title: row["ob_text"],
      heading: row["ob_heading"],
      gndelev: row["ob_gndelev"],
      elevoffset: row["ob_elevoffset"],
      model_id: row["ob_model"],
      model_name: row["mo_name"],
      stg: row["obpath"] + row["ob_tile"] + ".stg",
      country: row["ob_country"],
    },
    rowToModelGroup(row)
  );
}

function rowToModelGroup(row) {
  if (row["mg_name"]) {
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

function rowtoObjectGroup(row) {
  return {
    id: row["gp_id"],
    name: row["gp_name"],
  };
}

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

router.get("/groups", function (request, response, next) {
  Query({
    name: "Select Groups",
    text: "SELECT gp_id, gp_name \
             FROM fgs_groups \
             order by gp_name asc",
  })
    .then((result) => {
      const objectGroups = result.rows.map(rowtoObjectGroup);
      return response
        .set({
          "Cache-Control": "public, max-age=604800",
          ETAG: objectGroups.map((g) => g.id).join(""),
        })
        .json(objectGroups);
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

router.get("/search", function (request, response, next) {
  console.log("search");
  const query = new ObjectSearchQuery()
    .forDescription(request.query.description)
    .forModifedOn(request.query.modifiedOn)
    .forModifiedBefore(request.query.modifiedBefore)
    .forModifiedSince(request.query.modifiedSince)
    .forLatitude(request.query.lat)
    .forLongitude(request.query.lon)
    .forPoint(request.query.point)
    .forGndElevation(request.query.elevation)
    .forElevOffset(request.query.elevoffset)
    .forHeading(request.query.heading)
    .forCountry(request.query.country)
    .forModelName(request.query.modelname)
    .forModelId(request.query.model)
    .forModelgroup(request.query.modelgroup)
    .forObjectgroup(request.query.groupid)
    .forTile(request.query.tile)
    .forAuthor(request.query.author)
    .withPaging(request.query.limit, request.query.offset)
    .withOrder({column: request.query['order.column'], dir: request.query['order.dir']})
    .makeQuery();
  console.log(query)

  Query(query)
    .then((result) => {
      return response.json(toFeatureCollection(result.rows));
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

router.get("/countries", function (request, response, next) {
  Query({
    name: "Select countries",
    text: "SELECT * FROM fgs_countries ORDER BY co_name",
  })
    .then((result) => {
      return response.json(
        result.rows.map((row) => {
          return { code: row.co_code, name: row.co_name };
        })
      );
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

router.get("/:id", function (request, response, next) {
  var id = Number(request.params.id);

  if (isNaN(id)) {
    return response.status(500).send("Invalid Request");
  }

  Query({
    name: "Select Object By Id",
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

router.put("/:id", [
  authenticatedRequestValidation,
],
  function (request, response, next) {
  var id = Number(request.params.id);

  if (isNaN(id)) {
    return response.status(500).send("Invalid Request");
  }

  Query({
    name: "Update Object",
    text: "UPDATE fgs_objects \
          SET ob_text=$1, \
            wkb_geometry=ST_PointFromText('POINT($2 $3)', 4326), \
            ob_country=$4, \
            ob_gndelev=-9999, \
            ob_elevoffset=$5, \
            ob_heading=$6, \
            ob_model=$7, \
            ob_group=1 \
          WHERE ob_id= $8;",
    values: [id],
  })
    .then((result) => {
      if (0 == result.rows.length) {
        return response.status(404).send("updating object failed");
      }
      return response.json(rowToObjectFeature(result.rows[0]));
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

router.delete("/:id", [
  authenticatedRequestValidation,
  param('id').isInt(),
],
  function (request, response, next) {
  var id = Number(request.params.id);

  if (isNaN(id)) {
    return response.status(500).send("Invalid Request");
  }

  Query({
    name: "Delete Object",
    text: "DELETE FROM fgs_objects WHERE ob_id=$1;",
    values: [id],
  })
    .then((result) => {
      if (0 == result.rowCount) {
        return response.status(404).send(`deleting object with id ${id} failed`);
      }
      return response.status(204).send("Deleted");
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

router.get("/", function (request, response, next) {
  if (!(isNumber(request.query.e) && isNumber(request.query.w) && isNumber(request.query.n) && isNumber(request.query.s))) {
    return response.status(500).send("Invalid query options");
  }
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


router.post("/", [ authenticatedRequestValidation,
  checkBodyAndQuery('description').isString().trim().escape(),
  checkBodyAndQuery('longitude').isLength({max: 20}).isFloat({min: -180, max: 180}).toFloat(),       // .isLatLong()
  checkBodyAndQuery('latitude').isLength({max: 20}).isFloat({min: -90, max: 90}).toFloat(),
  checkBodyAndQuery('obOffset').optional().isNumeric().isInt({min: -1000, max: 1000}),
  checkBodyAndQuery('heading').isNumeric().isInt({min: 0, max: 360}).toInt(),
  checkBodyAndQuery('countryCode').isISO31661Alpha2(),
  checkBodyAndQuery('modelId').isNumeric().isInt({min: 1}).toInt(),
], function (request, response, next) {

  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }

  const data = matchedData(request);
  const description = data.description;
  const longitude = data.longitude;
  const latitude = data.latitude;
  const obOffset = data.obOffset;
  const heading = data.heading;
  const countryCode = data.countryCode;
  const modelId = data.modelId;

  Query({
    name: "Insert Object",
    text: "INSERT INTO fgs_objects (ob_id, ob_text, wkb_geometry, ob_gndelev, ob_elevoffset, ob_heading, ob_country, ob_model, ob_group, ob_modified) \
            VALUES (DEFAULT, $1, ST_PointFromText('POINT($2 $3)', 4326), -9999, $4, $5, $6, $7, 1, now()) RETURNING ob_id;",
    values: [
      description, longitude, latitude, (obOffset == 0 || obOffset == '')?"NULL": obOffset, heading, countryCode, modelId,
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
