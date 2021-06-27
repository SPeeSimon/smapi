const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const BasicStrategy = require("passport-http").BasicStrategy;
const { UserDao, NoAuthenticationFoundError } = require("../dao/UserDao");

const SYSTEM_GITHUB = 1;
const SYSTEM_GOOGLE = 2;
const SYSTEM_FACEBOOK = 3;
const SYSTEM_TWITTER = 4;
const SYSTEM_BASIC = 99;

const StrategyConf = {
  facebook: {
    enabled: `${process.env.AUTH_FACEBOOK_ENABLED}`,
    clientID: `${process.env.AUTH_FACEBOOK_CLIENTID}`,
    clientSecret: `${process.env.AUTH_FACEBOOK_SECRET}`,
    callbackURL: "auth/facebook/callback",
  },

  github: {
    enabled: `${process.env.AUTH_GITHUB_ENABLED}`,
    clientID: `${process.env.AUTH_GITHUB_CLIENTID}`,
    clientSecret: `${process.env.AUTH_GITHUB_SECRET}`,
    callbackURL: "auth/github/callback",
  },

  google: {
    enabled: `${process.env.AUTH_GOOGLE_ENABLED}`,
    clientID: `${process.env.AUTH_GOOGLE_CLIENTID}`,
    clientSecret: `${process.env.AUTH_GOOGLE_SECRET}`,
    callbackURL: "auth/google/callback",
  },

  twitter: {
    enabled: `${process.env.AUTH_TWITTER_ENABLED}`,
    consumerKey: `${process.env.AUTH_TWITTER_KEY}`,
    consumerSecret: `${process.env.AUTH_TWITTER_SECRET}`,
    callbackURL: "auth/twitter/callback",
  },
};


if (process.env.node_env === "development") {
  console.log('Add BASIC authentication for dev')
  StrategyConf['basic'] = {
      enabled: true,
      clientID: '',
      clientSecret: '',
      callbackURL: "auth/basic/callback",
    };
}



// READ OAUTH settings from ENV
for (strategyKey in StrategyConf) {
  const conf = process.env["OAUTH_" + strategyKey];
  if (!conf) {
    continue;
  }
  try {
    StrategyConf[strategyKey] = Object.assign({}, StrategyConf[strategyKey], JSON.parse(conf));
  } catch {
    console.error("can't parse OAUTH config for ", strategyKey, conf);
  }
}

function handleSuccess(user, done) {
  // console.log("Authenticated succesfull for user", user);
  if (!user) {
    return done(null, null);
  }
  return done(null, user);
}

function handleError(err, done) {
  if (err instanceof NoAuthenticationFoundError) {
    console.error("Authentication error", err);
    return done(null, null);
  }
  return done(err);
}

function getCallbackUrl(suffix) {
  var urlPrefix = "http://localhost:3001/";
  if (process.env.node_env !== "development") {
    urlPrefix = process.env.urlprefix;
    if (!urlPrefix) {
      console.log("urlprefix environment not set!");
      urlPrefix = "";
    }
  }
  urlPrefix = urlPrefix.replace(/\/+$/, "");
  return urlPrefix + "/" + suffix.replace(/^\/+/, "");
}

module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
    // store user id in session
    done(null, JSON.stringify({ authId: user.authorityId, userId: user.id }));
  });

  passport.deserializeUser(function (user, done) {
    // read user id from session
    console.log('serialize user', user)
    let requestedUser = null;
    try {
      requestedUser = JSON.parse(user);
    } catch (ex) {
      const msg = "can't deserialize user";
      console.err(msg, ex);
      return done(msg);
    }
    UserDao.find(requestedUser.authId, requestedUser.userId)
      .then((user) => handleSuccess(user, done))
      .catch((err) => handleError(err, done));
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: StrategyConf.google.clientID,
        clientSecret: StrategyConf.google.clientSecret,
        callbackURL: getCallbackUrl(StrategyConf.google.callbackURL),
        passReqToCallback: true,
      },
      function (request, token, refreshToken, profile, done) {
        console.log("github callback with user", request.user, "profile", profile);
        UserDao.find(SYSTEM_GOOGLE, request.user ? request.user.authorityId : profile.id)
          .then((user) => handleSuccess(user, done))
          .catch((err) => handleError(err, done));
        /*
      user.google.id = profile.id
      user.google.token = profile.token
      user.google.name = profile.displayName
      user.name = user.name || user.google.name
      user.google.email = profile.emails[0].value
      user.google.imgUrl = profile.photos[0].value
      user.save(function(err) {
        if (err)
          throw err;
        return done(null, user)
      })
*/
      }
    )
  );

  passport.use(
    new GitHubStrategy(
      {
        clientID: StrategyConf.github.clientID,
        clientSecret: StrategyConf.github.clientSecret,
        callbackURL: getCallbackUrl(StrategyConf.github.callbackURL),
        passReqToCallback: true,
      },
      function (request, token, refreshToken, profile, done) {
        console.log("github callback with user", request.user, "profile", profile);
        UserDao.find(SYSTEM_GITHUB, request.user ? request.user.authorityId : profile.id)
          .then((user) => handleSuccess(user, done))
          .catch((err) => handleError(err, done));
      }
    )
  );

  passport.use(
    new TwitterStrategy(
      {
        consumerKey: StrategyConf.twitter.consumerKey,
        consumerSecret: StrategyConf.twitter.consumerSecret,
        callbackURL: getCallbackUrl(StrategyConf.twitter.callbackURL),
        passReqToCallback: true,
      },
      function (request, token, tokenSecret, profile, done) {
        console.log("twitter callback with user", request.user, "profile", profile);
        var filter = request.user
          ? {
              _id: request.user._id,
            }
          : {
              "twitter.id": profile.id,
            };

        UserDao.find(SYSTEM_TWITTER, username)
          .then((user) => handleSuccess(user, done))
          .catch((err) => handleError(err, done));
        // User.findOne(filter, function (err, user) {

        //   user.twitter.id = profile.id;
        //   user.twitter.token = profile.token;
        //   user.twitter.name = profile.displayName;
        //   user.name = user.name || user.twitter.name;
        //   user.twitter.imgUrl = profile.photos[0].value;
        //   user.save(function (err) {
        //     if (err) {
        //       throw err;
        //     }
        //     return done(null, user);
        //   });
        // });
      }
    )
  );

  passport.use(
    new FacebookStrategy(
      {
        clientID: StrategyConf.facebook.clientID,
        clientSecret: StrategyConf.facebook.clientSecret,
        callbackURL: getCallbackUrl(StrategyConf.facebook.callbackURL),
        passReqToCallback: true,
      },
      function (request, token, refreshToken, profile, done) {
        console.log("facebook callback with user", request.user, "profile", profile);

        var filter = request.user
          ? {
              _id: request.user._id,
            }
          : {
              "facebook.id": profile.id,
            };

        UserDao.find(SYSTEM_FACEBOOK, username)
          .then((user) => handleSuccess(user, done))
          .catch((err) => handleError(err, done));

        // User.findOne(filter, function (err, user) {
        //   user.facebook.id = profile.id;
        //   //      user.facebook.token = profile.token
        //   user.facebook.name = profile.displayName;
        //   user.name = user.name || user.facebook.name;
        //   //      user.facebook.imgUrl = profile._json.avatar_url
        //   user.save(function (err) {
        //     if (err) {
        //       throw err;
        //     }
        //     return done(null, user);
        //   });
        // });
      }
    )
  );


  if (process.env.node_env === "development") {
    console.log('Added for development: BasicStrategy')
    passport.use(new BasicStrategy(function (username, password, done) {
        UserDao.find(SYSTEM_BASIC, username)
          .then((user) => handleSuccess(user, done))
          .catch((err) => handleError(err, done));
      }
    ));
  }

};
