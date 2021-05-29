const express = require("express");
const Query = require("../pg");
const tar = require("tar");
const util = require("util");

var router = express.Router();

function toNumber(x) {
  var n = Number(x || 0);
  return isNaN(n) ? 0 : n;
}

router.get("/:id/tgz", function (req, res, next) {
  var id = Number(req.params.id || 0);
  if (isNaN(id)) {
    return res.status(500).send("Invalid Request");
  }

  Query(
    {
      name: "ModelsTarball",
      text: "select mo_modelfile from fgs_models where mo_id = $1",
      values: [id],
    },
    function (err, result) {
      if (err) return res.status(500).send("Database Error");
      if (0 == result.rows.length) return res.status(404).send("model not found");
      if (result.rows[0].mo_modelfile == null) return res.status(404).send("no modelfile");

      var buf = new Buffer(result.rows[0].mo_modelfile, "base64");
      res.writeHead(200, { "Content-Type": "application/gzip" });
      //Response.AppendHeader("content-disposition", "attachment; filename=\"" + fileName +"\"");
      res.end(buf);
    }
  );
});

function getThumb(req, res, next) {
  var id = Number(req.params.id || 0);
  if (isNaN(id)) {
    return res.status(500).send("Invalid Request");
  }

  Query(
    {
      name: "ModelsThumb",
      text: "select mo_thumbfile,mo_modified from fgs_models where mo_id = $1",
      values: [id],
    },
    function (err, result) {
      if (err) {
        return res.status(500).send("Database Error");
      }

      if (0 == result.rows.length) {
        return res.status(404).send("model not found");
      }

      if (result.rows[0].mo_thumbfile == null) return res.status(404).send("no thumbfile");

      var buf = new Buffer(result.rows[0].mo_thumbfile, "base64");
      res.writeHead(200, {
        "Content-Type": "image/jpeg",
        "Last-Modified": result.rows[0].mo_modified,
        //      'ETag': etag(buf),
      });
      res.end(buf);
    }
  );
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

router.get("/:id/positions", function (req, res, next) {
  var id = Number(req.params.id || 0);
  if (isNaN(id)) {
    return res.status(500).send("Invalid Request");
  }

  Query(
    {
      name: "ModelPositions",
      text: "select ob_id, ST_AsGeoJSON(wkb_geometry),ob_country,ob_gndelev from fgs_objects where ob_model = $1 order by ob_country",
      values: [id],
    },
    function (err, result) {
      if (err) {
        return res.status(500).send("Database Error");
      }
      var featureCollection = {
        type: "FeatureCollection",
        features: [],
      };
      result.rows.forEach(function (r) {
        featureCollection.features.push({
          type: "Feature",
          geometry: JSON.parse(r.st_asgeojson),
          id: r.ob_id,
          properties: {
            id: r.ob_id,
            gndelev: r.ob_gndelev,
            country: r.ob_country,
          },
        });
      });
      return res.json(featureCollection);
    }
  );
});

router.get("/:id", function (req, res, next) {
  var id = Number(req.params.id || 0);
  if (isNaN(id)) {
    return res.status(500).send("Invalid Request");
  }

  Query(
    {
      name: "ModelDetail",
      text: "select mo_id,mo_path,mo_modified,mo_author,mo_name,mo_notes,mo_modelfile,mo_shared,au_name from fgs_models left join fgs_authors on mo_author=au_id where mo_id = $1",
      values: [id],
    },
    function (err, result) {
      if (err) {
        return res.status(500).send("Database Error");
      }

      if (0 == result.rows.length) {
        return res.status(404).send("model not found");
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
      var streambuf = new MultiStream(new Buffer(result.rows[0].mo_modelfile, "base64"));
      streambuf.on("end", (a) => {
        res.json(ret);
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
    }
  );
});

module.exports = router;
