const { Query } = require("../dao/pg");
/**
 * Database layer to access news from PostgreSQL database
 *
 * @copyright  2021 - FlightGear Team
 * @license    http://www.gnu.org/licenses/gpl-2.0.html  GNU General Public License, version 2
 */
class NewsPostDAO {
  // addNewsPost($newsPost) {
  //     // TODO
  // }

  // updateNewsPost($newsPost) {
  //     // TODO
  // }

  getNewsPost(newsPostId) {
    return Query({
      name: "NewsItem",
      text: "SELECT ne_id, ne_timestamp, ne_author, au_name, ne_text \
                FROM public.fgs_news \
                LEFT JOIN fgs_authors on au_id=ne_author \
                WHERE ne_id = $1",
      values: [newsPostId],
    }).then((result) => {
      if (0 == result.rows.length) {
        return null;
      }
      return this.getNewsPostFromRow(result.rows[0]);
    });
  }

  getNewsPosts(offset, limit) {
    return Query({
      name: "NewsList",
      text: "SELECT ne_id, ne_timestamp, ne_author, au_name, ne_text \
                FROM public.fgs_news\
                LEFT JOIN fgs_authors on au_id=ne_author \
                ORDER BY ne_timestamp DESC \
                limit $1 offset $2",
      values: [limit, offset],
    }).then((result) => result.rows.map(this.getNewsPostFromRow));
  }

  getLatestNewsPosts(limit) {
    return Query({
      name: "LatestNewsList",
      text: "SELECT ne_id, ne_timestamp, ne_author, au_name, ne_text \
                  FROM public.fgs_news \
                  LEFT JOIN fgs_authors on au_id=ne_author \
                  WHERE ne_timestamp > now() - interval '30 days' \
                  ORDER BY ne_timestamp DESC \
                  limit $1",
      values: [limit],
    }).then((result) => result.rows.map(this.getNewsPostFromRow));
  }

  getNewsPostFromRow(row) {
    return {
      id: row.ne_id,
      timestamp: row.ne_timestamp,
      author: {
        id: row.ne_author,
        name: row.au_name,
      },
      text: row.ne_text,
    };
  }
}

module.exports = { NewsPostDAO };
