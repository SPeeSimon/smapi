const express = require("express");
const {ModelDAO} = require('../dao/ModelDAO');
const {isNumber, isString, toNumber} = require("../utils/validations");

var router = express.Router();


router.get("/", function (request, response, next) {
  new ModelDAO().getModelsGroups()
    .then((result) => {
      response.json(result);
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

router.get("/:id", function (request, response, next) {
  new ModelDAO().getModelsGroup(toNumber(request.params.id))
    .then((result) => {
      if (!result) {
        return response.status(404).send("No modelgroup found");
      }
      response.json(result);
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

module.exports = router;
