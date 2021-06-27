const express = require("express");
const router = express.Router();
const dns = require("dns");
const http = require("http");
const https = require("https");
const Promise = require("promise");

const HRS_8_IN_SECONDS = 8 * 60 * 60; // 8 hours

function getRequestor(url) {
  if (url.startsWith("https://")) return https;
  else return http;
}

function GetStatus(url) {
  return new Promise(function (accept, reject) {
    getRequestor(url)
      .get(`${url}/.dirindex`, function (response) {
        if (response.statusCode !== 200) {
          response.resume();
          console.log("[TS]", `Error processing ${url}: `, response.statusCode, response.statusMessage);
          return reject({ url: url, error: response.statusMessage || `Remote error ${response.statusCode}` });
        }

        var data = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => (data += chunk));
        response.on("end", () => accept({ url: url, data: data }));
      })
      .on("error", function (err) {
        console.log("[TS]", `Error processing ${url}: `, err);
        return reject({ url: url, error: err });
      });
  });
}

function ParseDirindex(txt) {
  var reply = { d: {} };

  txt
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 1 && !line.startsWith("#"))
    .map((line) => line.split(":"))
    .forEach((token) => {
      switch (token[0]) {
        case "version":
          reply.version = token[1];
          break;
        case "path":
          reply.path = token[1] || "/";
          break;
        case "time":
          reply.time = token.slice(1).join(":");
          break;
        case "d":
          reply.d[token[1]] = token[2];
          break;
        case "t":
          break;
        default:
          break;
      }
    });

  return reply;
}

router.get("/status/", function (request, response, next) {
  const dnsname = "terrasync.flightgear.org";

  dns.resolve(dnsname, "NAPTR", function (err, addresses) {
    if (err) {
      console.log("[TS] dns resolved in error: ", err);
      response.status(500).json({ error: "Could not retrieve DNS information for terrasync" });
      return;
    }
    console.log("[TS] dns resolved in addresses:", addresses?.count);

    addresses = addresses || [];
    const prms = addresses.map((address, index) => {
      const separator = address.regexp.charAt(0);
      const addressTokens = address.regexp.split(separator);
      address.url = addressTokens[2];
      address.index = index;
      return GetStatus(address.url);
    });

    var responseValue = {
      title: "Terrasync Status",
      entries: [],
    };

    Promise.all(prms)
      .then((values) => {
        values
          .filter((value) => !value.error)
          .map((value) => { return {
              url: value.url,
              dirindex: ParseDirindex(value.data),
              dns: addresses.find((addr) => addr.url === value.url),
            };
          })
          .forEach((value) => responseValue.entries.push(value));

        response.set({
            "Cache-Control": "public, max-age=" + HRS_8_IN_SECONDS,
          });
      })
      .catch((err) => {
        console.log("[TS] Error retrieving remote information", err);
      })
      .finally(() => {
        response.json(responseValue);
      });
  });
});

module.exports = router;
