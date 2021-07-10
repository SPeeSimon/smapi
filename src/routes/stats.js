const express = require("express");
const { StatisticsDAO } = require("../dao/StatisticsDAO");

var router = express.Router();

router.get("/", function (request, response, next) {
  new StatisticsDAO()
    .getDatabaseCounts()
    .then((result) => {
      response.json({
        stats: {
          objects: result.objects,
          models: result.models,
          authors: result.authors,
          navaids: result.navaids,
          pending: result.pending,
          elev: result.groundElevations,
        },
      });
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

router.get("/all", function (request, response, next) {
  const convertDbRow = (row) => {
    return {
      date: row.date,
      objects: row.objects,
      models: row.models,
      authors: row.authors,
      signs: row.signs,
      navaids: row.navaids,
    };
  };

  new StatisticsDAO()
    .getStatistics()
    .then((result) => {
      const stats = result.map(convertDbRow);
      response.json({ statistics: stats });
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

router.get("/models/byauthor/:limit?/:offset?/:days?", function (request, response, next) {
  const offset = Number(request.params.offset || 0);
  const limit = Number(request.params.limit || 100);
  const days = Number(request.params.days || 0);

  let query;
  if (days > 0) {
    query = new StatisticsDAO().getStatisticsModelsByAuthorAndRange(limit, offset, days);
  } else {
    query = new StatisticsDAO().getStatisticsModelsByAuthor(limit, offset);
  }

  const convertDbRow = (row) => {
    return {
      author: row.author,
      author_id: row.id,
      count: row.count,
    };
  };

  query
    .then((result) => {
      const values = result.map(convertDbRow);
      response.json({ modelsbyauthor: values });
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

router.get("/models/bycountry", function (request, response, next) {
  const convertDbRow = (row) => {
    return {
      id: row.code,
      name: row.name,
      count: row.count,
      density: row.density,
    };
  };

  new StatisticsDAO()
    .getModelsByCountry()
    .then((result) => {
      response.json({
        modelsbycountry: result.map(convertDbRow),
      });
    })
    .catch((err) => {
      console.error("database error", err);
      return response.status(500).send("Database Error");
    });
});


module.exports = router;
