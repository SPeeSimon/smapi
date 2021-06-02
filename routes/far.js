var express = require("express");
var passport = require("passport");
var DB = require("../config/database.js");
var router = express.Router();
var jwt = require("jsonwebtoken");
var auth = require("../config/auth.js");
var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  host: "",
});

/* GET home page. */
router.get("/", function (request, response, next) {
  response.render("index", { title: "FlightGear Aviation Resources" });
});

router.get("/logout", function (request, response) {
  request.logout();
  response.redirect("/");
});

router.get(
  "/linkauthor",
  /*isLoggedIn, */ function (request, response, next) {
    response.render("linkauthor", { user: request.user });
  }
);

router.get(
  "/linkauthor/:token",
  /*isLoggedIn, */ function (request, response, next) {
    jwt.verify(request.params.token, auth.jwtAuth.secret, function (err, decoded) {
      if (err) {
        return response.status(404).send("Unknown token");
      }

      var email = decoded.data.email;
      var id = decoded.data.a;
      var extuser_id = decoded.data.b;

      console.log("linking", email, id, extuser_id);
      DB.getAuthorByEmail(email, function (err, user) {
        if (err) {
          return response.status(500).send("Database Error");
        }
        if (!user) {
          return response.status(404).send("Unknown user");
        }
        DB.SetAuthorForExternalUser(id, extuser_id, user.au_id, function (err) {
          if (err) {
            return response.status(500).send("Database Error: can't link");
          }
          return response.redirect("/login");
        });
      });
    });
  }
);

router.get("/linkauthor/checkmail/:email", function (request, response, next) {
  //  if(!request.isAuthenticated()) return response.json({});

  DB.getAuthorByEmail(request.params.email, function (err, data) {
    if (err) {
      return response.status(500).send("Database Error");
    }
    if (!data) {
      return response.json({});
    }
    return response.json({
      name: data.au_name || "",
      email: data.au_email || "",
      notes: data.au_notes || "",
    });
  });
});

router.post(
  "/linkauthor",
  /*isLoggedIn, */ function (request, response, next) {
    var re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(request.body.email)) {
      return response.render("linkauthor", { user: request.user, data: request.body });
    }

    DB.getOrCreateAuthorByEmail(
      {
        email: request.body.email,
        name: request.body.name,
        notes: request.body.notes,
      },
      function (err, author) {
        if (err) {
          return response.status(500).send("Database Error");
        }
        var token = jwt.sign(
          {
            data: {
              email: author.au_email,
              a: request.user.authority.id,
              b: request.user.authority.user_id,
            },
          },
          auth.jwtAuth.secret,
          { expiresIn: "1d", issuer: "http://scenery.flightgear.org/", subject: "linkauthor" }
        );

        var LinkUrl = "http://caravan:3001/linkauthor/" + token;
        console.log("veryfy Link is ", LinkUrl);
        transporter.sendMail(
          {
            from: '"FlightGear Scenery Database"<no-reply@flightgear.org>',
            to: request.body.email,
            subject: "FlightGear Scenery Database - email verification",
            text: "Please verify your email address by following this link: " + LinkUrl,
          },
          function (err, info) {
            if (err) {
              console.log("Error sending confirmation email", err);
            } else {
              console.log("Sent confirmation email", info);
            }
          }
        );
        return response.redirect("/");
      }
    );
  }
);

router.get("/mypage", isLoggedIn, function (request, response, next) {
  console.log(request.user);
  response.render("mypage", { user: request.user });
});

router.get("/:page", function (request, response, next) {
  response.render(request.params.page, { title: "FlightGear Aviation Resources", user: request.user });
});

function login(request, response, next) {
  var authargs = {};
  if (request.params.method == "google") {
    authargs.scope = ["profile", "email"];
  }

  if (request.user) {
    console.log("authenticate ", request.params.method, request.user, request.account);
    passport.authenticate(request.params.method, authargs)(request, response, next);
  } else {
    console.log("authorize unknown user", request.params.method);
    passport.authorize(request.params.method, authargs)(request, response, next);
  }
}

function loginCallback(request, response, next) {
  passport.authenticate(request.params.method, function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return response.redirect("/login");
    }
    request.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      if (null == user.author.id) {
        return response.redirect("/linkauthor");
      }
      return response.redirect("/mypage");
    });
  })(request, response, next);
}

/*router.get('/auth/sourceforge', passport.authenticate('oauth') );
router.get('/auth/sourceforge/callback', passport.authenticate('oauth', { 
  failureRedirect: '/login' }),
  function(request, response) {
console.log("yay");
    // Successful authentication, redirect home.
    response.redirect('/');
});
*/

router.get("/auth/:method", login);

// the callback after google has authenticated the user
router.get("/auth/:method/callback", loginCallback);

function isLoggedIn(request, response, next) {
  // if user is authenticated in the session, carry on
  if (request.isAuthenticated()) {
    return next();
  }

  // if they aren't redirect them to the home page
  response.redirect("/");
}

module.exports = router;
