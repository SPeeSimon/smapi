const express = require("express");
const Query = require("../pg");
const zlib = require("zlib");
const util = require("util");

var router = express.Router();

function toNumber(x) {
  var n = Number(x || 0);
  return isNaN(n) ? 0 : n;
}

const unzip = util.promisify(zlib.unzip);
router.get("/", function (req, res, next) {
  Query(
    {
      name: "GetAllSubmissions",
      text: "SELECT spr_id,spr_hash,spr_base64_sqlz FROM fgs_position_requests ORDER BY spr_id ASC;",
      values: [],
    },
    function (err, result) {
      if (err) return res.status(500).send("Database Error");
      if (!(result && result.rows)) return res.json([]);

      let submissions = [];
      let proms = [];
      result.rows.forEach((row) => {
        proms.push(unzip(Buffer.from(row["spr_base64_sqlz"], "base64")));
      });

      Promise.all(proms)
        .then((data) => {
          data.forEach((s, idx) => {
            const submission = {
              id: result.rows[idx]["spr_id"],
              // hash: result.rows[idx]['spr_hash'],
              data: JSON.parse(s.toString()),
            };
            if (submission.data && submission.data.email) delete submission.data.email;
            submissions.push(submission);
          });
          res.json(submissions);
        })
        .catch((err) => {
          console.error(err);
          res.sendStatus(500);
        });
    }
  );
});

router.get("/:id", function (req, res, next) {
  Query(
    {
      name: "GetSubmissionsById",
      text: "SELECT spr_id,spr_hash,spr_base64_sqlz FROM fgs_position_requests WHERE spr_id=$1;",
      values: [toNumber(req.params.id)],
    },
    function (err, result) {
      if (err) return res.status(500).send("Database Error");
      if (!(result && result.rows && result.rows.length)) return res.status(404).send("Submission not found");

      const row = result.rows[0];
      unzip(Buffer.from(row["spr_base64_sqlz"], "base64"))
        .then((data) => {
          const submission = {
            id: row["spr_id"],
            // hash: row['spr_hash'],
            data: JSON.parse(data.toString()),
          };
          if (submission.data && submission.data.email) delete submission.data.email;
          res.json(submission);
        })
        .catch((err) => {
          console.error(err);
          res.sendStatus(500);
        });
    }
  );
});

module.exports = router;
