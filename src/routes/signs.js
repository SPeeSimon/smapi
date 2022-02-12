const express = require("express");
const {toNumber} = require("../utils/validations");
const { SignsDAO } = require("../dao/SignsDAO");

var router = express.Router();

router.get("/", function (request, response, next) {
  var east = toNumber(request.query.e);
  var west = toNumber(request.query.w);
  var north = toNumber(request.query.n);
  var south = toNumber(request.query.s);

  new SignsDAO().findWithinBoundary(east, west, north, south)
    .then((result) => {
      response.json({
        type: "FeatureCollection",
        features: result,
      });
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});


module.exports = router;
