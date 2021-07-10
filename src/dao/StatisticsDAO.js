const { Query } = require("./pg");

/*
 * Copyright (C) 2021 Flightgear Team
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 */

/**
 * Statistics DAO implementation for PostGreSQL
 */
class StatisticsDAO {
  constructor() {}

  getDatabaseCounts() {
    return Query({
      name: "Statistics ",
      text: "with t1 as (\
                      select count(*) objects \
                      from fgs_objects\
                  ), t2 as (\
                      select count(*) models \
                      from fgs_models\
                  ), t3 as (\
                      select count(*) authors \
                      from fgs_authors\
                  ), t4 as (\
                      select count(*) navaids \
                      from fgs_navaids\
                  ), t5 as (\
                      select count(*) pends \
                      from fgs_position_requests\
                  ), t6 as (\
                      select count(*) gndelevs \
                      from fgs_objects \
                      where ob_gndelev=-9999\
                  ) \
                  select objects, models, authors, navaids, pends, gndelevs \
                  from t1, t2, t3, t4, t5, t6",
      values: [],
    }).then((result) => {
      var row = result.rows.length ? result.rows[0] : {};

      return {
        objects: Number(row.objects || 0),
        models: Number(row.models || 0),
        authors: Number(row.authors || 0),
        navaids: Number(row.navaids || 0),
        pending: Number(row.pends || 0),
        groundElevations: Number(row.gndelevs || 0),
      };
    });
  }

  getStatistics() {
    return Query({
      name: "StatisticsAll",
      text: "SELECT * from fgs_statistics ORDER BY st_date",
      values: [],
    }).then((result) => {
      return result.rows.map(this.rowToStatistic);
    });
  }

  rowToStatistic(row) {
    return {
      date: row.st_date,
      objects: Number(row.st_objects),
      models: Number(row.st_models),
      authors: Number(row.st_authors),
      signs: Number(row.st_signs),
      navaids: Number(row.st_navaids),
    };
  }

  getStatisticsModelsByAuthor(limit, offset) {
    return Query({
      name: "StatisticsModelsByAuthor",
      text: "SELECT COUNT(mo_id) AS count, au_name, au_id \
              FROM fgs_models, fgs_authors \
              WHERE mo_author = au_id \
              GROUP BY au_id \
              ORDER BY count DESC \
              limit $1 offset $2 ",
      values: [limit, offset],
    }).then(result => result.rows.map(this.rowToAuthorAndCount))
  }

  getStatisticsModelsByAuthorAndRange(limit, offset, days) {
    return Query({
      name: "StatisticsModelsByAuthorAndRange",
      text: "SELECT COUNT(mo_id) AS count, au_name, au_id \
              FROM fgs_models, fgs_authors \
              WHERE mo_author = au_id and mo_modified > now()::date - (interval '1 days' * $3) \
              GROUP BY au_id \
              ORDER BY count DESC \
              limit $1 offset $2 ",
      values: [limit, offset, days],
    }).then(result => result.rows.map(this.rowToAuthorAndCount))
  }

  rowToAuthorAndCount(row) {
    return {
        id: Number(row.au_id),
        author: row.au_name.trim(),
        count: Number(row.count),
      };
  }

  getModelsByCountry() {
    return Query({
      name: "StatisticsModelsByCountry",
      text: "SELECT co_code, trim(co_name) as co_name, \
                      co_three, \
                      COUNT(ob_id) AS count, \
                      COUNT(ob_id)/(SELECT shape_sqm/10000000000 FROM gadm2_meta WHERE iso ILIKE co_three) AS density \
                FROM fgs_objects \
                INNER JOIN fgs_countries ON ob_country = co_code \
                WHERE co_three IS NOT NULL \
                GROUP BY co_code \
                HAVING COUNT(ob_id)/(SELECT shape_sqm FROM gadm2_meta WHERE iso ILIKE co_three) > 0 \
                ORDER BY count DESC",
    })
    .then((result) => result.rows.map(this.rowToModelsByCountry));
  }

  rowToModelsByCountry(row) {
    return {
      code: row.co_code.trim(),
      codeThree: row.co_three.trim(),
      name: row.co_name.trim(),
      count: Number(row.count),
      density: Number(row.density || 0),
    };
  }
  
}

module.exports = { StatisticsDAO };
