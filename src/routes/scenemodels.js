const express = require("express");
const {Query} = require("../dao/pg");
const util = require("util");

var router = express.Router();


router.get("/navdb/airport/:icao", function (request, response, next) {
  if (!request.params.icao.match(/^[A-Za-z0-9]*$/)) {
    return response.json({});
  }
  Query({
    name: "ModelsSearchByAuthor",
    //      text: "SELECT pr_id, pr_runways, pr_name, pr_type FROM fgs_procedures WHERE pr_airport = UPPER($1);",
    text: "select ST_AsGeoJSON(wkb_geometry) as rwy from apt_runway where icao=UPPER($1);",
    values: [request.params.icao],
  })
    .then((result) => {
      var j = {
        runwaysGeometry: {
          type: "GeometryCollection",
          geometries: result.rows.map((row) => JSON.parse(row.rwy)),
        },
        procedures: [],
      };
      response.json(j);
    })
    .catch((error) => {
      return response.status(500).send("Database Error");
    });
});

module.exports = router;
