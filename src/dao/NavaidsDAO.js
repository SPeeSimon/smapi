const { Query } = require("../dao/pg");
const util = require("util");

/**
 * Database layer to access navaids from PostgreSQL database
 *
 * @copyright  2022 - FlightGear Team
 * @license    http://www.gnu.org/licenses/gpl-2.0.html  GNU General Public License, version 2
 */
class NavaidsDAO {
  rowToNavaidFeature(row) {
    return {
      type: "Feature",
      id: row["si_id"],
      geometry: {
        type: "Point",
        coordinates: [row["na_lon"], row["na_lat"]],
      },
      properties: {
        id: row["na_id"],
        type: row["na_type"],
        elevation: row["na_elevation"],
        frequency: row["na_frequency"],
        range: row["na_range"],
        multiuse: row["na_multiuse"],
        ident: row["na_ident"],
        name: row["na_name"],
        airport: row["na_airport_id"],
        runway: row["na_runway"],
      },
    };
  }

  findWithinBoundary(east, west, north, south) {
    return Query({
      name: "Select Navaids Within",
      text: `SELECT na_id, ST_Y(na_position) AS na_lat, ST_X(na_position) AS na_lon, 
                    na_type, na_elevation, na_frequency, na_range, na_multiuse, na_ident, na_name, na_airport_id, na_runway 
                FROM fgs_navaids 
                WHERE ST_Within(na_position, ST_GeomFromText($1,4326)) 
                LIMIT 400`,
      values: [
        util.format("POLYGON((%d %d,%d %d,%d %d,%d %d,%d %d))", west, south, west, north, east, north, east, south, west, south),
      ],
    }).then((result) => {
      return result.rows.map(this.rowToNavaidFeature);
    });
  }
}

module.exports = { NavaidsDAO };
