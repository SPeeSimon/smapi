const Query = require("./pg");

class UserDao {
  constructor() {
  }

  static find = function (authorityId, id) {
    return new Promise((resolve, reject) => {
      Query({
        name: "Select UserByExternalAuthority",
        text: "SELECT au_id,au_name,au_email,au_notes,au_modeldir \
                    FROM fgs_authors \
                    INNER JOIN fgs_extuserids ON au_id=eu_author_id \
                    WHERE eu_authority=$1 AND eu_external_id=$2",
        values: [authorityId, id],
      })
        .then((result) => {
          if (result.rowCount != 1) {
            return reject(new NoAuthenticationFoundError(authorityId, id, "User authentication not found"));
          }
          const user = new User();
          user.id = result.rows[0].au_id;
          user.name = result.rows[0].au_name;
          user.email = result.rows[0].au_email;
          user.notes = result.rows[0].au_notes;
          user.authorityId = authorityId;
          console.log("last login", result.rows[0].eu_lastlogin);
          user.lastLogin = new Date(); // fixme, get
          resolve(user);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  };
}


class User {
    constructor() {
      this.id = -1;
      this.name = "";
      this.email = "";
      this.notes = "";
      this.lastLogin = null;
    }
}


class NoAuthenticationFoundError extends Error {
  constructor(authority, externalId, ...params) {
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NoAuthenticationFoundError)
    }

    this.name = 'NoAuthenticationFoundError'
    // Custom debugging information
    this.authority = authority;
    this.externalId = externalId; 
  }
}


module.exports = {UserDao, User, NoAuthenticationFoundError};