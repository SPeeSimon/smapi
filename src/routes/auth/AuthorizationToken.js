const jwt = require("jsonwebtoken");
const Cookies = require("cookies");

const BEARER = "Bearer ";
const HTTP_AUTHORIZATION = "Authorization";

createToken = function (user) {
  const authenticationPayload = new AuthenticationPayload(
    `Flightgear API ${process.env.node_env}`,
    Math.random(),
    user.id,
    new Date()
  ).get();

  let token = jwt.sign(authenticationPayload, process.env.JWT_SECRET);
  // console.log('created token', token, authenticationPayload)
  return token;
};

hasAuthenticationToken = function (request) {
  let authCookie = null;
  if (request.headers.cookie) {
      authCookie = decodeURIComponent(new Cookies(request).get(HTTP_AUTHORIZATION));
  }
  if (authCookie == null) {
    authCookie = decodeURIComponent(request.get(HTTP_AUTHORIZATION));
  }
  if (!authCookie || !authCookie.startsWith(BEARER)) {
    return false;
  }

  const jsonWebToken = authCookie.substring(BEARER.length);
  const originalPayload = jwt.verify(jsonWebToken, process.env.JWT_SECRET); // here we check if the jwt is valid
  return originalPayload ? true : false;
};


authenticatedRequestValidation = function (request, response, next) {
  if (hasAuthenticationToken(request)) {
    return next();
  }
  return response.status(401).send("Unauthorized");
}


class AuthenticationPayload {
  constructor(system, sample, user_id, authentication_date) {
    this.system = system;
    this.sample = sample;
    this.user_id = user_id;
    this.authentication_date = authentication_date;
  }

  get() {
    return {
      system: this.system,
      sample: this.sample,
      user_id: this.user_id,
      authentication_date: this.authentication_date,
    };
  }
}

module.exports = { createToken, hasAuthenticationToken, authenticatedRequestValidation };
