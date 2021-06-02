const express = require("express");
const Query = require("../pg");
const tar = require("tar");
const util = require("util");

var router = express.Router();

router.get("/:id/tgz", function (request, response, next) {
  var id = Number(request.params.id || 0);
  if (isNaN(id)) {
    return response.status(500).send("Invalid Request");
  }

  Query({
    name: "ModelsTarball",
    text: "select mo_path, mo_modelfile from fgs_models where mo_id = $1",
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
        //      'ETag': etag(buf),
      });
      response.end(buf);
    })
    .catch((err) => {
      response.status(500).send("Database Error");
    });
}

router.get("/:id/thumb", getThumb);
router.get("/:id/thumb.jpg", getThumb);

var stream = require("stream");
var MultiStream = function (object, options) {
  if (object instanceof Buffer || typeof object === "string") {
    options = options || {};
    stream.Readable.call(this, {
      highWaterMark: options.highWaterMark,
      encoding: options.encoding,
    });
  } else {
    stream.Readable.call(this, { objectMode: true });
  }
  this._object = object;
};

util.inherits(MultiStream, stream.Readable);

MultiStream.prototype._read = function () {
  this.push(this._object);
  this._object = null;
};

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
    text: "select mo_id,mo_path,mo_modified,mo_author,mo_name,mo_notes,mo_modelfile,mo_shared,au_name \
          from fgs_models \
          left join fgs_authors on mo_author=au_id \
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
        content: [],
      };
      var streambuf = new MultiStream(Buffer.from(result.rows[0].mo_modelfile, "base64"));
      streambuf.on("end", (a) => {
        response.json(ret);
      });

      streambuf.pipe(
        tar.t({
          onentry: (entry) => {
            ret.content.push({
              filename: entry.header.path,
              filesize: entry.header.size,
            });
          },
        })
      );
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

module.exports = router;
