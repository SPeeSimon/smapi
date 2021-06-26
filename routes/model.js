const express = require("express");
const Query = require("../pg");
const tar = require("tar");
const MultiStream = require("../utils/MultiStream");
const { buildCheckFunction, validationResult, matchedData, param } = require('express-validator');
const checkBodyAndQuery = buildCheckFunction(['body', 'query']);

var router = express.Router();


function hasAuthorisation(request, response, next) {
  if (true) {
    return response.status(401).send("Unauthorized");
  }
  next();
}


router.get("/:id/tgz", function (request, response, next) {
  var id = Number(request.params.id || 0);
  if (isNaN(id)) {
    return response.status(500).send("Invalid Request");
  }

  Query({
    name: "ModelsTarball",
    text: "select mo_path, mo_modelfile, mo_modified from fgs_models where mo_id = $1",
    values: [id],
  })
    .then((result) => {
      if (0 == result.rows.length) {
        return response.status(404).send("model not found");
      }
      if (result.rows[0].mo_modelfile == null) {
        return response.status(404).send("no modelfile");
      }

      var buf = Buffer.from(result.rows[0].mo_modelfile, "base64");
      response.writeHead(200, {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${result.rows[0].mo_path}"`,
        "Last-Modified": result.rows[0].mo_modified,
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

  Query({
    name: "ModelsThumb",
    text: "select mo_thumbfile,mo_modified from fgs_models where mo_id = $1",
    values: [id],
  })
    .then((result) => {
      if (0 == result.rows.length) {
        return response.status(404).send("model not found");
      }

      if (result.rows[0].mo_thumbfile == null) {
        return response.status(404).send("no thumbfile");
      }

      var buf = Buffer.from(result.rows[0].mo_thumbfile, "base64");
      response.writeHead(200, {
        "Content-Type": "image/jpeg",
        "Last-Modified": result.rows[0].mo_modified,
      });
      response.end(buf);
    })
    .catch((err) => {
      response.status(500).send("Database Error");
    });
}

router.get("/:id/thumb", getThumb);
router.get("/:id/thumb.jpg", getThumb);


router.get("/:id/positions", function (request, response, next) {
  var id = Number(request.params.id || 0);
  if (isNaN(id)) {
    return response.status(500).send("Invalid Request");
  }

  Query({
    name: "ModelPositions",
    text: "select ob_id, ob_model, ST_AsGeoJSON(wkb_geometry),ob_country,ob_gndelev \
            from fgs_objects \
            where ob_model = $1 \
            order by ob_country",
    values: [id],
  })
    .then((result) => {
      var featureCollection = {
        type: "FeatureCollection",
        features: result.rows.map(rowToModelPositionFeature),
        model: id,
      };
      return response.json(featureCollection);
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

function rowToModelPositionFeature(row) {
  return {
    type: "Feature",
    geometry: JSON.parse(row.st_asgeojson),
    id: row.ob_id,
    properties: {
      id: row.ob_id,
      gndelev: row.ob_gndelev,
      country: row.ob_country,
    },
  };
}

router.get("/:id", function (request, response, next) {
  var id = Number(request.params.id || 0);
  if (isNaN(id)) {
    return response.status(500).send("Invalid Request");
  }

  Query({
    name: "ModelDetail",
    text: "select mo_id,mo_path,mo_modified,mo_author,mo_name,mo_notes,mo_modelfile,mo_shared,mg_id,mg_name,au_name \
          FROM fgs_models \
          LEFT JOIN fgs_modelgroups on fgs_models.mo_shared = fgs_modelgroups.mg_id \
          LEFT JOIN fgs_authors on mo_author=au_id \
          where mo_id = $1",
    values: [id],
  })
    .then((result) => {
      if (0 == result.rows.length) {
        return response.status(404).send("model not found");
      }

      var row = result.rows[0];
      var ret = {
        id: row.mo_id,
        filename: row.mo_path,
        modified: row.mo_modified,
        authorId: row.mo_author,
        name: row.mo_name,
        notes: row.mo_notes,
        shared: row.mo_shared,
        author: row.au_name,
        authorId: row.mo_author,
        modelgroup: {
          id: row.mg_id,
          name: row.mg_name,
          shared: row.mg_id == 0,
        },
        // raw: row.mo_modelfile,
        content: [],
      };

      if (!row.mo_modelfile) {
        // no model file (should be error)
        return response.json(ret);
      }

      var streambuf = new MultiStream(Buffer.from(row.mo_modelfile, "base64"));
      streambuf.on("end", (a) => {
        response.json(ret);
      });

      streambuf.on("error", e => console.log('error reading stream', e));

      streambuf.pipe(
        tar.t({
          onentry: (entry) => {
            ret.content.push({
              filename: entry.header.path,
              filesize: entry.header.size,
            });
          },
          onerror: er => console.log('tar error', er),
        })
      );
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

router.post("/", [hasAuthorisation,
  checkBodyAndQuery('path').not().isEmpty().trim().escape(),
  checkBodyAndQuery('author').isNumeric().toInt(),
  checkBodyAndQuery('name').not().isEmpty().trim().escape(),
  checkBodyAndQuery('notes').trim().escape(),
  checkBodyAndQuery('thumbfile').isBase64(),
  checkBodyAndQuery('modelfile').isBase64().notEmpty(),
  checkBodyAndQuery('shared').isNumeric().toInt(),
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

  Query({
    name: "Insert Model",
    text: "INSERT INTO fgs_models (mo_id, mo_path, mo_author, mo_name, mo_notes, mo_thumbfile, mo_modelfile, mo_shared, mo_modified) \
            VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, now()) \
            RETURNING mo_id",
    values: [
      path, Number(author), name, notes, thumbfile, modelfile, Number(shared)
    ],
  })
    .then((result) => {
      if (0 == result.rows.length) {
        return response.status(412).send("model not created");
      }
      response.status(201).set({
        'Location': `/model/${result.rows[0].mo_id}`
      }).json(result.rows[0]);

    })
    .catch((err) => {
      console.log(err.severity, 'inserting model (', err.code, '):', err.detail)
      return response.status(500).send("Database Error");
    });
});


router.delete("/:id", [
  hasAuthorisation,
  param('id').isInt(),
],
  function (request, response, next) {
  var id = Number(request.params.id);

  if (isNaN(id)) {
    return response.status(500).send("Invalid Request");
  }

  Query({
    name: "Delete Model",
    text: "DELETE FROM fgs_models WHERE mo_id=$1;",
    values: [id],
  })
    .then((result) => {
      if (0 == result.rowCount) {
        return response.status(404).send(`deleting model with id ${id} failed`);
      }
      return response.status(204).send("Deleted");
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});


module.exports = router;
