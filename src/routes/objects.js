"use strict";
const express = require("express");
const auth = require("./auth");
const {isNumber, toNumber} = require("../utils/validations");
const { buildCheckFunction, validationResult, matchedData, param } = require('express-validator');
const { authenticatedRequestValidation } = require("./auth/AuthorizationToken");
const { ObjectSearchQuery } = require("../dao/ObjectSearchQuery");
const { ObjectDAO } = require('../dao/ObjectDAO');
const { ModelDAO } = require("../dao/ModelDAO");
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
    id: row.id,
    geometry: {
      type: "Point",
      coordinates: [row.position.longitude, row.position.latitude],
    },
    properties: rowToObjectProperties(row),
  };
}

function rowToObjectProperties(row) {
  return Object.assign(
    {
      id: row.id,
      title: row.title,
      heading: row.position.heading,
      gndelev: row.position.groundElevation,
      elevoffset: row.position.elevationOffset,
      model_id: row.model_id,
      model_name: row.model_name,
      stg: row.stg,
      country: row.country,
    },
    rowToModelGroup(row),
    rowToObjectsGroup(row),
  );
}

function rowToModelGroup(row) {
  if (row.modelgroup) {
    return {
      modelgroup: row.modelgroup
    };
  }
  return {};
}

function rowToObjectsGroup(row) {
  if (row.objectsgroup && row.objectsgroup.id) {
    return {
      objectsgroup: row.objectsgroup
    };
  }
  return {};
}


router.get("/list/:limit?/:offset?", function (request, response, next) {
  var offset = Number(request.params.offset || 0);
  var limit = Number(request.params.limit || 100);

  if (isNaN(offset) || isNaN(limit)) {
    return response.status(500).send("Invalid Request");
  }

  new ObjectDAO().searchObject(
    new ObjectSearchQuery().withPaging(limit, offset)
  )
    .then((result) => {
      return response.json(toFeatureCollection(result));
    })
    .catch((err) => {
      console.log(err)
      return response.status(500).send("Database Error");
    });
});

router.get("/groups", function (request, response, next) {
  new ObjectDAO().getObjectsGroups()
    .then((objectGroups) => {
      return response
        .set({
          "Cache-Control": "public, max-age=604800",
          ETAG: objectGroups.map((g) => g.id).join(""),
        })
        .json(objectGroups);
    })
    .catch((err) => {
      console.log(err)
      return response.status(500).send("Database Error");
    });
});

router.get("/search", function (request, response, next) {
  new ObjectDAO().searchObject(
    new ObjectSearchQuery()
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
  )
    .then((result) => {
      return response.json(toFeatureCollection(result));
    })
    .catch((err) => {
      console.log(err)
      return response.status(500).send("Database Error");
    });
});

router.get("/countries", function (request, response, next) {
  new ObjectDAO().getCountries()
    .then((result) => {
      return response.json(result);
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

  new ObjectDAO().getObject(id)
    .then((result) => {
      if (!result) {
        return response.status(404).send("object not found");
      }

      new ModelDAO().getModelMetadata(result.model_id)
        .then(m => {
          const obj = rowToObjectFeature(result)
          obj.properties.model_name = m.name;
          return response.json(obj);
        })

    })
    .catch((err) => {
      console.log(err)
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


  new ObjectDAO().updateObject(data)
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

  new ObjectDAO().deleteObject(id)
    .then((result) => {
      if (result) {
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

  new ObjectDAO().searchObject(
    new ObjectSearchQuery()
        .forBoundary(north, east, south, west)
  )
    .then((result) => {
      return response.json(toFeatureCollection(result));
    })
    .catch((err) => {
      console.log(err)
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

  new ObjectDAO().addObject(data)
    .then((result) => {
      return response.json(toFeatureCollection(result));
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

module.exports = router;
