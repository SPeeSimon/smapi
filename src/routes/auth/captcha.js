const express = require("express");
const recaptcha = require('../../services/captcha');
const router = express.Router();

router.get("/", function (request, response, next) {
    return response.send(recaptcha.getPublicKey());
});

module.exports = router;
