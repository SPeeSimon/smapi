"use strict";
const express = require("express");
const Query = require("../pg");
const util = require("util");
const auth = require("./auth");
const DEFAULT_LIMIT = 20;
const OFFSET_START = 0;

var router = express.Router();


function isString(s) {
  return s !== undefined && s !== null && s !== "" && s !== "null";
}

function isNumber(x) {
  return !isNaN(Number(x));
}

function toNumber(x) {
  var n = Number(x || 0);
  return isNaN(n) ? 0 : n;
}

function toFeatureCollection(rows) {
  return {
    type: "FeatureCollection",
    features: rows.map(rowToObjectFeature),
  };
}

function rowToObjectFeature(row) {
  return {
    type: "Feature",
    id: row["ob_id"],
    geometry: {
      type: "Point",
      coordinates: [row["ob_lon"], row["ob_lat"]],
    },
    properties: rowToObjectProperties(row),
  };
}

function rowToObjectProperties(row) {
  return Object.assign(
    {
      id: row["ob_id"],
      title: row["ob_text"],
      heading: row["ob_heading"],
      gndelev: row["ob_gndelev"],
      elevoffset: row["ob_elevoffset"],
      model_id: row["ob_model"],
      model_name: row["mo_name"],
      stg: row["obpath"] + row["ob_tile"] + ".stg",
      country: row["ob_country"],
    },
    rowToModelGroup(row)
  );
}

function rowToModelGroup(row) {
  if (row["mg_name"]) {
    return {
      modelgroup: {
        id: row["mg_id"],
        name: row["mg_name"],
        shared: row["mg_id"] === 0,
      },
      shared: row["mg_id"],
    };
  }
  return {};
}

router.get("/list/:limit?/:offset?", function (request, response, next) {
  var offset = Number(request.params.offset || 0);
  var limit = Number(request.params.limit || 100);

  if (isNaN(offset) || isNaN(limit)) {
    return response.status(500).send("Invalid Request");
  }

  Query({
    name: "Select Objects",
    text: "SELECT ob_id, ob_text, ob_country, ob_model, ST_Y(wkb_geometry) AS ob_lat, ST_X(wkb_geometry) AS ob_lon, \
             ob_heading, ob_gndelev, ob_elevoffset, mo_shared, mg_id, mg_name, mo_name, \
             concat('Objects/', fn_SceneDir(wkb_geometry), '/', fn_SceneSubDir(wkb_geometry), '/') AS obpath, ob_tile \
             FROM fgs_objects \
             LEFT JOIN fgs_models on fgs_models.mo_id = fgs_objects.ob_model \
             LEFT JOIN fgs_modelgroups on fgs_models.mo_shared = fgs_modelgroups.mg_id \
             order by ob_modified desc \
             limit $1 offset $2",
    values: [limit, offset],
  })
    .then((result) => {
      return response.json(toFeatureCollection(result.rows));
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});




router.get("/search", function (request, response, next) {
  console.log("search");
  const query = new ObjectSearchQuery()
    .forDescription(request.query.description)
    .forModifedOn(request.query.modifiedOn)
    .forModifiedBefore(request.query.modifiedBefore)
    .forModifiedSince(request.query.modifiedSince)
    .forLatitude(request.query.lat)
    .forLongitude(request.query.lon)
    .forPoint(request.query.point)
    .forGndElevation(request.query.elevation)
    .forElevOffset(request.query.elevoffset)
    .forHeading(request.query.heading)
    .forCountry(request.query.country)
    .forModelName(request.query.modelname)
    .forModelId(request.query.model)
    .forModelgroup(request.query.groupid || request.query.modelgroup)
    .forTile(request.query.tile)
    .forAuthor(request.query.author)
    .withPaging(request.query.limit, request.query.offset)
    .withOrder(request.query.order)
    .makeQuery();
  // console.log(query)

  Query(query)
    .then((result) => {
      return response.json(toFeatureCollection(result.rows));
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

router.get("/countries", function (request, response, next) {
  Query({
    name: "Select countries",
    text: "SELECT * FROM fgs_countries ORDER BY co_name",
  })
    .then((result) => {
      return response.json(result.rows.map(row => {
        return { code: row.co_code, name: row.co_name };
      }));
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

router.get("/:id", function (request, response, next) {
  var id = Number(request.params.id);

  if (isNaN(id)) {
    return response.status(500).send("Invalid Request");
  }

  Query({
    name: "Select Object By Id",
    text: "SELECT ob_id, ob_text, ob_country, ob_model, ST_Y(wkb_geometry) AS ob_lat, ST_X(wkb_geometry) AS ob_lon, \
             ob_heading, ob_gndelev, ob_elevoffset, mo_shared, mg_id, mg_name, mo_name, \
             concat('Objects/', fn_SceneDir(wkb_geometry), '/', fn_SceneSubDir(wkb_geometry), '/') AS obpath, ob_tile \
             FROM fgs_objects \
             LEFT JOIN fgs_models on fgs_models.mo_id = fgs_objects.ob_model \
             LEFT JOIN fgs_modelgroups on fgs_models.mo_shared = fgs_modelgroups.mg_id \
             WHERE ob_id = $1",
    values: [id],
  })
    .then((result) => {
      if (0 == result.rows.length) {
        return response.status(404).send("object not found");
      }
      return response.json(rowToObjectFeature(result.rows[0]));
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

router.get("/", function (request, response, next) {
  if (!(isNumber(request.query.e) && isNumber(request.query.w) && isNumber(request.query.n) && isNumber(request.query.s))) {
    return response.status(500).send("Invalid query options");
  }
  var east = toNumber(request.query.e);
  var west = toNumber(request.query.w);
  var north = toNumber(request.query.n);
  var south = toNumber(request.query.s);


  Query({
    name: "Select Objects Within",
    text: "SELECT ob_id, ob_text, ob_country, ob_model, ST_Y(wkb_geometry) AS ob_lat, ST_X(wkb_geometry) AS ob_lon, \
            ob_heading, ob_gndelev, ob_elevoffset, mo_shared, mg_id, mg_name, mo_name, \
            concat('Objects/', fn_SceneDir(wkb_geometry), '/', fn_SceneSubDir(wkb_geometry), '/') AS obpath, ob_tile \
            FROM fgs_objects \
            LEFT JOIN fgs_models on fgs_models.mo_id = fgs_objects.ob_model \
            LEFT JOIN fgs_modelgroups on fgs_models.mo_shared = fgs_modelgroups.mg_id \
            WHERE ST_Within(wkb_geometry, ST_GeomFromText($1,4326)) \
            LIMIT 400",
    values: [
      util.format("POLYGON((%d %d,%d %d,%d %d,%d %d,%d %d))", west, south, west, north, east, north, east, south, west, south),
    ],
  })
    .then((result) => {
      return response.json(toFeatureCollection(result.rows));
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

module.exports = router;

class ObjectSearchQuery {
  queryName = "Search Object By ";
  queryParams = [];
  queryFilters = [];
  queryPaging = "";
  orderBy = "ob_modified DESC";

  constructor() {}

  currentParamIndex() {
    return '$' + (this.queryParams.length + 1);
  }

  forDescription(description) {
    if (isString(description)) {
      this.withFilter("D", `ob_text like ${this.currentParamIndex()}`, `%${description}%`);
    }
    return this;
  }
  forModifedOn(modified) {
    if (modified !== undefined && /[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(modified)) {
      this.withFilter("MO", `date_trunc('DAY', ob_modified) = ${this.currentParamIndex()}`, modified);
    }
    return this;
  }
  forModifiedSince(modified) {
    if (modified !== undefined && /[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(modified)) {
      this.withFilter("MS", `ob_modified >= ${this.currentParamIndex()}`, modified);
    }
    return this;
  }
  forModifiedBefore(modified) {
    if (modified !== undefined && /[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(modified)) {
      this.withFilter("MB", `ob_modified < ${this.currentParamIndex()}`, modified);
    }
    return this;
  }
  forLatitude(lat) {
    if (lat !== undefined && isNumber(lat)) {
      this.withFilter("Lat", `CAST (ST_Y(wkb_geometry) AS text) like ${this.currentParamIndex()}`, lat + "%");
    }
    return this;
  }
  forLongitude(lon) {
    if (lon !== undefined && isNumber(lon)) {
      this.withFilter("Long", `CAST (ST_X(wkb_geometry) AS text) like ${this.currentParamIndex()}`, lon + "%");
    }
    return this;
  }
  forPoint(point) {
    if (isString(point)) {
      const latlon = point.split(",");
      if (latlon.length == 2 && isNumber(latlon[0]) && isNumber(latlon[1])) {
        this.withFilter("P", `wkb_geometry = ST_PointFromText(${this.currentParamIndex()}, 4326)`, "POINT(" + latlon[0] + ' ' + latlon[1] + ")");
      }
    }
    return this;
  }
  forGndElevation(gndElev) {
    if (gndElev !== undefined && isNumber(gndElev)) {
      this.withFilter("GE", `(ob_gndelev BETWEEN ${this.currentParamIndex()} -25 AND ${this.currentParamIndex()} +25)`, Number(gndElev));
    }
    return this;
  }
  forElevOffset(elevOffset) {
    if (elevOffset !== undefined && isNumber(elevOffset)) {
      this.withFilter("Eo", `(ob_elevoffset BETWEEN ${this.currentParamIndex()} -25 AND ${this.currentParamIndex()} +25)`, Number(elevOffset));
    }
    return this;
  }
  forHeading(heading) {
    if (isString(heading)) {
      this.withFilter("H", `(ob_heading BETWEEN ${this.currentParamIndex()} -5 AND ${this.currentParamIndex()} +5)`, Number(heading));
    }
    return this;
  }
  forCountry(country) {
    if (isString(country)) {
      this.withFilter("Cy", `ob_country = ${this.currentParamIndex()}`, country);
    }
    return this;
  }
  forModelName(name) {
    if (isString(name)) {
      this.withFilter("Mn", `ob_model in (SELECT mo_id FROM fgs_models WHERE mo_name like ${this.currentParamIndex()})`, `%${name}%`);
    }
    return this;
  }
  forModelId(model) {
    if (model !== undefined && isNumber(model)) {
      this.withFilter("M", `ob_model = ${this.currentParamIndex()}`, Number(model));
    }
    return this;
  }
  forModelgroup(modelgroup) {
    if (modelgroup !== undefined && isNumber(modelgroup)) {
      this.withFilter("Mg", `ob_group = ${this.currentParamIndex()}`, Number(modelgroup));
    }
    return this;
  }
  forTile(tile) {
    if (tile !== undefined && isNumber(tile)) {
      this.withFilter("T", `ob_tile = ${this.currentParamIndex()}`, Number(tile));
    }
    return this;
  }
  forAuthor(author) {
    if (isString(author)) {
      this.withFilter("Au", `ob_submitter like ${this.currentParamIndex()}`, `%${author}%`);
    }
    return this;
  }
  withFilter(name, condition, param) {
    this.queryName += name + ",";
    this.queryFilters.push(condition);
    this.queryParams.push(param);
  }
  withPaging(limit, offset) {
    this.queryPaging += ` limit ${this.currentParamIndex()}`;
    if (limit && isNumber(limit)) {
      this.queryParams.push(limit);
    } else {
      this.queryParams.push(DEFAULT_LIMIT);
    }
    this.queryPaging += ` offset ${this.currentParamIndex()}`;
    if (offset && isNumber(offset)) {
      this.queryParams.push(offset);
    } else {
      this.queryParams.push(OFFSET_START);
    }
    return this;
  }
  withOrder(order) {
    // order = { column: "1", dir: "asc" };
    // ORDER BY mo_modified DESC

    // var order_cols = {
    //   1: "mo_id",
    //   2: "mo_name",
    //   3: "mo_path",
    //   4: "mo_notes",
    //   5: "mo_modified",
    //   6: "mo_shared",
    // };

    // order_col = order_cols[toNumber(order[0].column)] || "mo_id";
    // order_dir = order[0].dir === "asc" ? "ASC" : "DESC";
    return this;
  }
  makeQuery() {
    return {
      name: this.queryName,
      text:
        "SELECT ob_id, ob_text, ob_country, ob_model, ST_Y(wkb_geometry) AS ob_lat, ST_X(wkb_geometry) AS ob_lon, \
                   ob_heading, ob_gndelev, ob_elevoffset, mo_shared, mg_id, mg_name, mo_name, \
                   concat('Objects/', fn_SceneDir(wkb_geometry), '/', fn_SceneSubDir(wkb_geometry), '/') AS obpath, ob_tile \
            FROM fgs_objects \
            LEFT JOIN fgs_models on fgs_models.mo_id = fgs_objects.ob_model \
            LEFT JOIN fgs_modelgroups on fgs_models.mo_shared = fgs_modelgroups.mg_id \
            WHERE " +
        ["1=1", ...this.queryFilters].join(" AND ") +
        ' ORDER BY ' + this.orderBy + 
        this.queryPaging,
      values: this.queryParams,
    };
  }
}
