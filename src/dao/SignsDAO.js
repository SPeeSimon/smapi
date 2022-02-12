const { Query } = require("../dao/pg");
const util = require("util");

/**
 * Database layer to access signs from PostgreSQL database
 *
 * @copyright  2022 - FlightGear Team
 * @license    http://www.gnu.org/licenses/gpl-2.0.html  GNU General Public License, version 2
 */
class SignsDAO {
  rowToSignsFeature(row) {
    return {
      type: "Feature",
      id: row["si_id"],
      geometry: {
        type: "Point",
        coordinates: [row["ob_lon"], row["ob_lat"]],
      },
      properties: {
        id: row["si_id"],
        heading: row["si_heading"],
        definition: row["si_definition"],
        gndelev: row["si_gndelev"],
      },
    };
  }

  findWithinBoundary(east, west, north, south) {
    return Query({
      name: "Select Signs Within",
      text: `SELECT si_id, ST_Y(wkb_geometry) AS ob_lat, ST_X(wkb_geometry) AS ob_lon, 
            si_heading, si_gndelev, si_definition 
            FROM fgs_signs 
            WHERE ST_Within(wkb_geometry, ST_GeomFromText($1,4326)) 
            LIMIT 400`,
      values: [
        util.format("POLYGON((%d %d,%d %d,%d %d,%d %d,%d %d))", west, south, west, north, east, north, east, south, west, south),
      ],
    }).then((result) => {
      return result.rows.map(this.rowToSignsFeature);
    });
  }
}

module.exports = { SignsDAO };
