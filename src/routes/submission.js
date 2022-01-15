const express = require("express");
const {RequestDAO} = require('../dao/RequestDao')
const zlib = require("zlib");
const util = require("util");
const { authenticatedRequestValidation } = require("./auth/AuthorizationToken");
const {toNumber} = require("../utils/validations");
const unzip = util.promisify(zlib.unzip);

var router = express.Router();

router.get("/", function (request, response, next) {

  new RequestDAO().getPendingRequests()
    .then((result) => {
      if (result.length === 0) {
        return response.json([]);
      }

      let submissions = [];
      let proms = result.rows.map((row) => unzip(Buffer.from(row["spr_base64_sqlz"], "base64")));

      Promise.all(proms)
        .then((data) => {
          data.forEach((s, idx) => {
            const submission = {
              id: result.rows[idx]["spr_id"],
              // hash: result.rows[idx]['spr_hash'],
              data: JSON.parse(s.toString()),
            };
            if (submission.data && submission.data.email) {
              delete submission.data.email;
            }
            submissions.push(submission);
          });
          response.json(submissions);
        })
        .catch((err) => {
          console.error(err);
          response.sendStatus(500);
        });
    })
    .catch((err) => {
      console.log('ERROR', request, err)
      return response.status(500).send("Database Error");
    });
});

router.get("/:id", function (request, response, next) {
  new RequestDAO().getRequest(toNumber(request.params.id))
    .then((result) => {
      if (result.rows.length === 0) {
        return response.status(404).send("Submission not found");
      }

      const row = result.rows[0];
      unzip(Buffer.from(row["spr_base64_sqlz"], "base64"))
        .then((data) => {
          const submission = {
            id: row["spr_id"],
            // hash: row['spr_hash'],
            data: JSON.parse(data.toString()),
          };
          if (submission.data && submission.data.email) {
            delete submission.data.email;
          }
          response.json(submission);
        })
        .catch((err) => {
          console.error(err);
          response.sendStatus(500);
        });
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

module.exports = router;
