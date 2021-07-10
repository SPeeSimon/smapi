const { Query } = require("./pg");
const { ObjectSearchQuery } = require("./ObjectSearchQuery");
/**
 * Database layer to access objects from PostgreSQL database
 *
 * @copyright  2021 - FlightGear Team
 * @license    http://www.gnu.org/licenses/gpl-2.0.html  GNU General Public License, version 2
 */
class ObjectDAO {
  getCountryFromRow(row) {
    // $country = new \model\Country();
    if (row["co_code"]) {
      return { code: row["co_code"], name: row["co_name"], codeThree: row["co_three"] };
    }
    return null;
  }

  getObjectGroupFromRow(row) {
    // $objectsGroup = new \model\ObjectsGroup();
    return {
      id: row["gp_id"],
      name: row["gp_name"],
    };
  }

  getObjectFromRow(row) {
    // $object = new \model\TheObject();
    return {
      id: row["ob_id"],
      title: row["ob_text"],
      position: {
        longitude: row["ob_lon"],
        latitude: row["ob_lat"],
        groundElevation: row["ob_gndelev"],
        elevationOffset: row["ob_elevoffset"],
        orientation: row["ob_heading"],
        heading: row["ob_heading"],
      },
      dir: row["ob_dir"],
      description: row["ob_text"],
      groupId: row["ob_group"],
      lastUpdated: row["ob_modified"],
      model_id: row["ob_model"],
      model_name: row["mo_name"],
      stg: row["obpath"] + row["ob_tile"] + ".stg",
      country: this.getCountryFromRow(row),
      objectsgroup: this.getObjectGroupFromRow(row),
    };
  }

  addObject(obj) {
    // TheObject
    return Query({
      name: "Insert Object",
      text: "INSERT INTO fgs_objects (ob_id, ob_text, wkb_geometry, ob_gndelev, ob_elevoffset, ob_heading, ob_country, ob_model, ob_group, ob_modified) \
            VALUES (DEFAULT, $1, ST_PointFromText('POINT($2 $3)', 4326), -9999, $4, $5, $6, $7, 1, now()) RETURNING ob_id;",
      values: [
        obj.description,
        obj.longitude,
        obj.latitude,
        obj.obOffset == 0 || obj.obOffset == "" ? "NULL" : obj.obOffset,
        obj.heading,
        obj.countryCode,
        obj.modelId,
      ],
    }).then((result) => {
      if (0 == result.rowCount) {
        throw new Error("Adding object failed!");
      }
      return Object.assign({}, obj, { id: result.rows[0].ob_id });
    });
  }

  updateObject(obj) {
    return Query({
      name: "Update Object",
      text: "UPDATE fgs_objects \
                  SET ob_text=$1, \
                    wkb_geometry=ST_PointFromText('POINT($2 $3)', 4326), \
                    ob_country=$4, \
                    ob_gndelev=-9999, \
                    ob_elevoffset=$5, \
                    ob_heading=$6, \
                    ob_model=$7, \
                    ob_group=1 \
                  WHERE ob_id= $8;",
      values: [
        obj.description,
        obj.position.longitude,
        obj.position.latitude,
        obj.country.code,
        $objPos.elevationOffset,
        $objPos.orientation,
        obj.modelId,
        obj.id,
      ],
    }).then((result) => {
      if (0 == result.rowCount) {
        throw new Error("Updating object failed!");
      }
      return obj;
    });
  }

  deleteObject(objectId) {
    return Query({
      name: "Delete Object",
      text: "DELETE FROM fgs_objects WHERE ob_id=$1",
      values: [objectId],
    }).then((result) => 1 == result.rowCount);
  }

  getObject(objectId) {
    return Query({
      name: "Object Get",
      text: "SELECT *, ST_Y(wkb_geometry) AS ob_lat, ST_X(wkb_geometry) AS ob_lon, fn_SceneDir(wkb_geometry) AS ob_dir, concat('Objects/', fn_SceneDir(wkb_geometry), '/', fn_SceneSubDir(wkb_geometry), '/') AS obpath \
            FROM fgs_objects \
            LEFT JOIN fgs_countries ON ob_country = co_code \
            LEFT JOIN fgs_groups ON ob_group=gp_id \
            LEFT JOIN (SELECT mo_id, mo_name FROM fgs_models) model ON model.mo_id = ob_model \
            WHERE ob_id=$1",
      values: [objectId],
    }).then((result) => {
      if (0 == result.rowCount) {
        throw new Error(`No object with id ${objectId} was found!`);
      }
      return this.getObjectFromRow(result.rows[0]);
    });
  }

  searchObject(objectSeachQuery) {
    const query = objectSeachQuery.makeQuery();
    return Query(query).then((result) => result.rows.map((row) => this.getObjectFromRow(row)));
  }

  getObjectsAt(long, lat) {
    // new ObjectSearchQuery().forPoint(`${long} ${lat}`).makeQuery()
    return Query({
      name: "Objects at LongLat",
      text: "SELECT *, ST_Y(wkb_geometry) AS ob_lat, ST_X(wkb_geometry) AS ob_lon, fn_SceneDir(wkb_geometry) AS ob_dir, concat('Objects/', fn_SceneDir(wkb_geometry), '/', fn_SceneSubDir(wkb_geometry), '/') AS obpath \
            FROM fgs_objects, \
            JOIN fgs_countries ON ob_country = co_code \
            LEFT JOIN fgs_groups ON ob_group=gp_id \
            LEFT JOIN (SELECT mo_id, mo_name FROM fgs_models) model ON model.mo_id = ob_model \
            WHERE wkb_geometry = ST_PointFromText($1, 4326)",
      values: [`POINT(${long} ${lat})`],
    }).then((result) => result.rows.map(this.getObjectFromRow));
  }

  getObjectsByModel(modelId) {
    const query = new ObjectSearchQuery().forModelId(modelId).makeQuery();
    return Query(query).then((result) => result.rows.map((row) => this.getObjectFromRow(row)));
  }

  getObjectsGroup(objectGroupId) {
    return Query({
      name: "Select Groups",
      text: "SELECT gp_id, gp_name \
                     FROM fgs_groups \
                     WHERE gp_id=$1",
      values: [objectGroupId],
    }).then((result) => this.getObjectGroupFromRow(result.rows[0]));
  }

  getObjectsGroups() {
    return Query({
      name: "Select Groups",
      text: "SELECT gp_id, gp_name \
                     FROM fgs_groups \
                     order by gp_name asc",
    }).then((result) => {
      return result.rows.map(this.getObjectGroupFromRow);
    });
  }

  getCountry(countryCode) {
    return Query({
      name: "Select countries",
      text: "SELECT * FROM fgs_countries WHERE co_code=$1",
      values: [countryCode],
    }).then((result) => {
      return result.rows.map(this.getCountryFromRow);
    });
  }

  getCountryAt(long, lat) {
    return Query({
      name: "Select countries",
      text: "SELECT fgs_countries.* \
                    FROM gadm2, fgs_countries \
                    WHERE ST_Within(ST_PointFromText($1, 4326), gadm2.wkb_geometry) \
                      AND gadm2.iso ILIKE fgs_countries.co_three",
      values: [`POINT(${long} ${lat})`],
    }).then((result) => {
      // // If not found, return Unknown
      // if (!$row) {
      //     return this.getCountry('zz');
      // }
      return result.rows.map(this.getCountryFromRow);
    });
  }

  getCountries() {
    return Query({
      name: "Select countries",
      text: "SELECT * FROM fgs_countries ORDER BY co_name",
    }).then((result) => {
      // Map<code.country>?
      return result.rows.map(this.getCountryFromRow);
    });
  }

  countObjects() {
    return Query({
      name: "ObjectsCount",
      text: "SELECT count(*) AS number FROM fgs_objects",
    }).then((result) => result.rows[0].number);
  }

  countObjectsByModel(modelId) {
    return Query({
      name: "ObjectsCountByModel",
      text: "SELECT COUNT(*) AS number \
                    FROM fgs_objects \
                    WHERE ob_model=$1",
      values: [modelId],
    }).then((result) => result.rows[0].number);
  }

  checkObjectAlreadyExists(object) {
    // Querying...
    query = "";

    if ($objPos.getElevationOffset() == 0) {
      query =
        "SELECT count(*) AS number \
            FROM fgs_objects \
            WHERE wkb_geometry = ST_PointFromText($1, 4326) \
              AND ob_elevoffset IS NULL \
              AND ob_heading = $3\
              AND ob_model = $4";
    } else {
      query =
        "SELECT count(*) AS number \
            FROM fgs_objects \
            WHERE wkb_geometry = ST_PointFromText($1, 4326) \
              AND ob_elevoffset = $2 \
              AND ob_heading = $3\
              AND ob_model = $4";
    }

    return Query({
      name: "ObjectExists",
      text: query,
      values: [
        `POINT(${object.position.getLongitude} ${object.position.getLatitude})`,
        object.position.getElevationOffset(),
        object.position.getOrientation(),
        object.getModelId(),
      ],
    }).then((result) => result.rows[0].number > 0);
  }

  detectNearbyObjects(lat, lon, obModelId, dist = 15) {
    // Querying...
    return Query({
      name: "ModelMetadata per id",
      text: "SELECT fn_getnearestobject($1, $2, $3)",
      values: [obModelId, lon, lat],
    }).then((result) => result.rowCount > 0);
  }
}

module.exports = { ObjectDAO };
