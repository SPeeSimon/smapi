"use strict";
const jwt = require("jsonwebtoken");

module.exports = function (passport) {
  const router = require("express").Router();

  router.get("/:provider", function (request, response, next) {
    const args = {
      twitter: {
        scope: ["profile", "email"],
      },
      google: {
        scope: ["profile", "email"],
      },
      facebook: {
        scope: "email",
      },
      github: {},
    }[request.params.provider];
    if (!args) return response.status(404).send("Unknown provider");

    passport.authenticate(request.params.provider, args)(request, response, next);
  });

  router.get("/:provider/callback", function (request, response, next) {
    passport.authenticate(request.params.provider, { session: false }, function (err, user, info) {
      if (err) {
        console.log("Passport.authenticate() error", err);
        return response.status(500).send("Sorry - there was an error when processing this request");
      }
      if (!user) return response.redirect("/linkaccount");

      let token = jwt.sign(user.id, process.env.JWT_SECRET);
      response.cookie("Authorization", "Bearer " + token, {
        maxAge: 1000 * 60 * 15, // would expire after 15 minutes
        httpOnly: false, // The cookie only accessible by the web server
        signed: false, // Indicates if the cookie should be signed
      });
      response.redirect("/");
    })(request, response, next);
  });

  return router;
};
