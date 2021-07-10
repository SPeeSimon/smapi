const {Query} = require("../dao/pg");

/**
 * Database layer to access authors from PostgreSQL database
 *
 * @copyright  2021 - FlightGear Team
 * @license    http://www.gnu.org/licenses/gpl-2.0.html  GNU General Public License, version 2
 */
class AuthorDAO {

    rowtoAuthor(row) {
        return {
          id: row.au_id,
          name: row.au_name,
          email: row["au_email"],
          description: row["au_notes"],
        };
    }

    addAuthor(author) {
        return Query({
            name: "Insert Author",
            text: "INSERT INTO fgs_authors(au_id, au_name, au_email) VALUES (DEFAULT, $1, $2) RETURNING au_id",
            values: [author.name, author.email],
          })
        .then((result) => {
            if (0 == result.rows.length) {
                throw Error('Author not created');
            }
            return this.rowtoAuthor(Object.assign({}, { au_notes: null, count: 0, au_name: name, }, result.rows[0]));
        });        
    }

    // updateAuthor(Author author) {
    //     //TODO
    // }
    
    getAuthor(authorId) {
        return Query({
          name: "AuthorById",
          text: "select au_id, au_name, au_notes, coalesce(models_for_author, 0) as count \
                from fgs_authors \
                left join (\
                  select mo_author, count(mo_id) models_for_author \
                  from fgs_models \
                  group by mo_author\
                ) model_count on au_id=mo_author \
                where au_id = $1",
          values: [authorId],
        })
          .then((result) => {
            if (0 == result.rows.length) {
              return null;
            }
            return this.rowtoAuthor(result.rows[0]);
          })
    }
    
    getAuthorByEmail(email) {
        return Query({
            name: "AuthorByEmail",
            text: "select au_id, au_name, au_notes, coalesce(models_for_author, 0) as count \
                  from fgs_authors \
                  left join (\
                    select mo_author, count(mo_id) models_for_author \
                    from fgs_models \
                    group by mo_author\
                  ) model_count on au_id=mo_author \
                  where au_email = $1",
            values: [email],
          })
            .then((result) => {
              if (0 == result.rows.length) {
                return null;
              }
              return this.rowtoAuthor(result.rows[0]);
            })
    }
    
    getAllAuthors(offset, limit) {
        // console.log('all authors', 'limit', limit, 'offset', offset)
        return Query({
            name: "AuthorsList",
            text: "select au_id, au_name, au_notes, coalesce(models_for_author, 0) as count \
                  from fgs_authors \
                  left join (\
                    select mo_author, count(mo_id) models_for_author \
                    from fgs_models \
                    group by mo_author\
                  ) model_count on au_id=mo_author \
                  order by au_name asc \
                  limit $1 offset $2",
            values: [limit, offset],
          })
            .then((result) => {
              return (result.rows.map(this.rowtoAuthor));
            })
    }

}

module.exports = {AuthorDAO};