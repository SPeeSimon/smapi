const express = require("express");
const tar = require("tar");
const MultiStream = require("../utils/MultiStream");
const { buildCheckFunction, validationResult, matchedData, param } = require("express-validator");
const { authenticatedRequestValidation } = require("./auth/AuthorizationToken");
const checkBodyAndQuery = buildCheckFunction(["body", "query"]);
const { ModelDAO } = require("../dao/ModelDAO");
const { ObjectDAO } = require("../dao/ObjectDAO");
const { SingleFileTransmitter } = require('../utils/FileUtils');

var router = express.Router();

router.get("/:id/tgz", function (request, response, next) {
  var id = Number(request.params.id || 0);
  if (isNaN(id)) {
    return response.status(500).send("Invalid Request");
  }

  new ModelDAO()
    .getModelFiles(id)
    .then((result) => {
      if (!result) {
        return response.status(404).send("model not found");
      }

      var buf = Buffer.from(result.modelfile, "base64");
      response.writeHead(200, {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${result.path}"`,
        "Last-Modified": result.modified,
      });
      response.end(buf);
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

function getThumb(request, response, next) {
  var id = Number(request.params.id || 0);
  if (isNaN(id)) {
    return response.status(500).send("Invalid Request");
  }

  new ModelDAO()
    .getThumbnail(id)
    .then((result) => {
      if (!result) {
        return response.status(404).send("model not found");
      }

      var buf = Buffer.from(result.thumbfile, "base64"); // thumbnail?
      response.writeHead(200, {
        "Content-Type": "image/jpeg",
        "Last-Modified": result.modified,
      });
      response.end(buf);
    })
    .catch((err) => {
      console.log(err);
      response.status(500).send("Database Error");
    });
}

router.get("/:id/thumb", getThumb);
router.get("/:id/thumb.jpg", getThumb);

router.get(["/:id/AC3D", "/:id/ac3d", "/:id/ac"], function (request, response, next) {
  const id = Number(request.params.id || 0);
  if (isNaN(id)) {
    return response.status(500).send("Invalid Request");
  }

  new ModelDAO()
    .getModelFiles(id)
    .then((result) => {
      if (!result) {
        return response.status(404).send("model not found");
      }

      new MultiStream(Buffer.from(result.modelfile, "base64"))
            .on("error", (e) => console.log("error reading stream", e))
            .pipe(tar.list()) // read archive
              .on('entry', entry => {
                if (entry.path.endsWith('.ac')) {
                  response.redirect(`./model-content/${entry.path}`);
                }
              })
              .on('error', e => console.log('Error reading archive from model', id, e))
              .on('end', () => {
                if (!(response.statusCode > 300 && response.statusCode < 400)) {
                  return response.status(404).send(`AC3D file not found for model ${id}`);
                }
              });
    })
    .catch((err) => {
      console.log(err);
      return response.status(500).send("Database Error");
    });
});


router.get("/:id/model-content/:name", function (request, response, next) {
  var id = Number(request.params.id || 0);
  if (isNaN(id) || !request.params.name) {
    return response.status(500).send("Invalid Request");
  }

  new ModelDAO()
    .getModelFiles(id)
    .then((result) => {
      if (!result) {
        return response.status(404).send("model not found");
      }

      const fileTransmitter = new SingleFileTransmitter(request.params.name); // send requested file from archive

      new MultiStream(Buffer.from(result.modelfile, "base64")) // stream archive content
              .on("error", (e) => console.log("error reading stream", e)) // if error in streaming, log
              .pipe(new tar.Parse()) // treat as archive
              .on('entry', entry => fileTransmitter.processArchiveEntry(entry, response, result)) // handle archive entries
              .on('end', () => fileTransmitter.handleClosing(response)); // close stream of notify not found
    })
    .catch((err) => {
      console.log(err);
      return response.status(500).send("Database Error");
    });
});


router.get("/:id/positions", function (request, response, next) {
  var id = Number(request.params.id || 0);
  if (isNaN(id)) {
    return response.status(500).send("Invalid Request");
  }

  new ObjectDAO()
    .getObjectsByModel(id)
    .then((result) => {
      var featureCollection = {
        type: "FeatureCollection",
        features: result.map(rowToModelPositionFeature),
        model: id,
      };
      return response.json(featureCollection);
    })
    .catch((err) => {
      console.log(err);
      return response.status(500).send("Database Error");
    });
});

function rowToModelPositionFeature(row) {
  return {
    type: "Feature",
    geometry: toGeoJson(row.position),
    id: row.id,
    properties: {
      id: row.id,
      gndelev: row.position.groundElevation,
      country: row.country,
    },
  };
}

function toGeoJson(position) {
  return {
    type: "Point",
    coordinates: [position.longitude, position.latitude],
  };
}

router.get("/:id", function (request, response, next) {
  var id = Number(request.params.id || 0);
  if (isNaN(id)) {
    return response.status(500).send("Invalid Request");
  }

  new ModelDAO()
    .getModel(id)
    .then((result) => {
      if (!result) {
        return response.status(404).send("model not found");
      }

      var row = result;
      var ret = {
        id: result.metadata.id,
        filename: result.metadata.filename,
        modified: result.metadata.lastUpdated,
        authorId: result.metadata.author.id,
        name: result.metadata.name,
        notes: result.metadata.description,
        shared: result.metadata.modelsGroup?.id,
        author: result.metadata.author,
        modelgroup: result.metadata.modelsGroup,
        // raw: row.modelFiles,
        content: [],
      };

      if (!row.modelFiles) {
        // no model file (should be error)
        return response.json(ret);
      }

      var streambuf = new MultiStream(Buffer.from(row.modelFiles, "base64")); // stream content
      streambuf.on("end", (a) => {
        response.json(ret); // on end of content, send result
      });

      streambuf.on("error", (e) => console.log("error reading stream", e)); // if error in streaming, log

      streambuf.pipe(
        // send content to tar.t (list the content of an archive)
        tar.list({
          onentry: (entry) => {
            // on tar content entry, save basic file details
            ret.content.push({
              filename: entry.header.path,
              filesize: entry.header.size,
            });
          },
          onerror: (er) => console.log("tar error", er), // error in tar
        })
      );
    })
    .catch((err) => {
      console.log(err);
      return response.status(500).send("Database Error");
    });
});

router.post(
  "/",
  [
    authenticatedRequestValidation,
    checkBodyAndQuery("path").not().isEmpty().trim().escape(),
    checkBodyAndQuery("author").isNumeric().toInt(),
    checkBodyAndQuery("name").not().isEmpty().trim().escape(),
    checkBodyAndQuery("notes").trim().escape(),
    checkBodyAndQuery("thumbfile").isBase64(),
    checkBodyAndQuery("modelfile").isBase64().notEmpty(),
    checkBodyAndQuery("shared").isNumeric().toInt(),
  ],
  function (request, response, next) {
    // insert new model

    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const path = request.query.path || request.body.path;
    const author = request.query.author || request.body.author;
    const name = request.query.name || request.body.name;
    const notes = request.query.notes || request.body.notes;
    const thumbfile = request.query.thumbfile || request.body.thumbfile;
    const modelfile = request.query.modelfile || request.body.modelfile;
    const shared = request.query.shared || request.body.shared;

    new ModelDAO()
      .addModel({})
      .then((result) => {
        if (0 == result.rows.length) {
          return response.status(412).send("model not created");
        }
        response
          .status(201)
          .set({
            Location: `/model/${result.rows[0].mo_id}`,
          })
          .json(result.rows[0]);
      })
      .catch((err) => {
        console.log(err.severity, "inserting model (", err.code, "):", err.detail);
        return response.status(500).send("Database Error");
      });
  }
);

router.delete("/:id", [authenticatedRequestValidation, param("id").isInt()], function (request, response, next) {
  return response.status(500).send("Not implemented");
});

module.exports = router;
