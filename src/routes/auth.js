"use strict";
const {createToken} = require("./auth/AuthorizationToken");

const AUTH_AGE_15MIN_IN_MS = 15 * 60 * 1000;
const AUTH_PROVIDERS = {
  facebook: {
    scope: "email",
  },
  github: {},
  google: {
    scope: ["profile", "email"],
  },
  twitter: {
    scope: ["profile", "email"],
  },
};

if (process.env.node_env === "development") {
  AUTH_PROVIDERS["basic"] = {
    scope: [],
  };
}

module.exports = function (passport) {
  const router = require("express").Router();


  router.get("/test", function (request, response, next) {
    response.send('test')
  });

  router.get("/:provider", function (request, response, next) {
    const authProvider = AUTH_PROVIDERS[request.params.provider];
    if (!authProvider) {
      return response.status(404).send("Unknown Authentication provider");
    }
    passport.authenticate(request.params.provider, authProvider)(request, response, next);
  });

  router.get("/:provider/callback", function (request, response, next) {
    const authProvider = AUTH_PROVIDERS[request.params.provider];
    if (!authProvider) {
      return response.status(404).send("Unknown Authentication provider");
    }

    passport.authenticate(request.params.provider, { session: false }, function (err, user, info) {
      if (err) {
        console.log("Authentication failure", err);
        return response.status(500).send("Sorry - there was an error when processing this request");
      }
      if (!user) {
        return response.redirect("/linkaccount");
      }
      console.log("Authentication success", user);

      const token = createToken(user);
      response.cookie("Authorization", "Bearer " + token, {
        maxAge: AUTH_AGE_15MIN_IN_MS, // expire after 15 minutes
        httpOnly: false, // The cookie only accessible by the web server
        signed: false, // Indicates if the cookie should be signed
      });
      // response.redirect("/");
      response.send("logged in");
    })(request, response, next);
  });

  return router;
};
