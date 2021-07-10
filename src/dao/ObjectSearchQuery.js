"use strict";
const { isNumber, isString, toNumber } = require("../utils/validations");
const util = require("util");

const DEFAULT_LIMIT = 20;
const OFFSET_START = 0;
const DATE_REGEXP = /[0-9]{4}-[0-1][0-9]-[0-3][0-9]/; // regexp for date formatted: yyyy-mm-dd

class ObjectSearchQuery {
  queryName = "Search Object By ";
  queryParams = [];
  queryFilters = [];
  queryPaging = "";
  orderBy = "ob_modified DESC";

  constructor() {}

  currentParamIndex() {
    return "$" + (this.queryParams.length + 1);
  }

  forDescription(description) {
    if (isString(description)) {
      this.withFilter("D", `ob_text like ${this.currentParamIndex()}`, `%${description}%`);
    }
    return this;
  }
  forModifedOn(modified) {
    if (modified !== undefined && DATE_REGEXP.test(modified)) {
      this.withFilter("MO", `date_trunc('DAY', ob_modified) = ${this.currentParamIndex()}`, modified);
    }
    return this;
  }
  forModifiedSince(modified) {
    if (modified !== undefined && DATE_REGEXP.test(modified)) {
      this.withFilter("MS", `ob_modified >= ${this.currentParamIndex()}`, modified);
    }
    return this;
  }
  forModifiedBefore(modified) {
    if (modified !== undefined && DATE_REGEXP.test(modified)) {
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
        this.withFilter(
          "P",
          `wkb_geometry = ST_PointFromText(${this.currentParamIndex()}, 4326)`,
          "POINT(" + latlon[0] + " " + latlon[1] + ")"
        );
      }
    }
    return this;
  }
  forBoundary(north, east, south, west) {
    if (isNumber(north) && isNumber(east) && isNumber(south) && isNumber(west)) {
      this.withFilter(
        "Wi",
        `ST_Within(wkb_geometry, ST_GeomFromText(${this.currentParamIndex()}, 4326))`,
        util.format("POLYGON((%d %d,%d %d,%d %d,%d %d,%d %d))", Number(west), Number(south), Number(west), Number(north), Number(east), Number(north), Number(east), Number(south), Number(west), Number(south))
      );
    }
    return this;
  }
  forGndElevation(gndElev) {
    if (gndElev !== undefined && isNumber(gndElev)) {
      this.withFilter(
        "GE",
        `(ob_gndelev BETWEEN ${this.currentParamIndex()} -25 AND ${this.currentParamIndex()} +25)`,
        Number(gndElev)
      );
    }
    return this;
  }
  forElevOffset(elevOffset) {
    if (elevOffset !== undefined && isNumber(elevOffset)) {
      this.withFilter(
        "Eo",
        `(ob_elevoffset BETWEEN ${this.currentParamIndex()} -25 AND ${this.currentParamIndex()} +25)`,
        Number(elevOffset)
      );
    }
    return this;
  }
  forHeading(heading) {
    if (isString(heading)) {
      this.withFilter(
        "H",
        `(ob_heading BETWEEN ${this.currentParamIndex()} -5 AND ${this.currentParamIndex()} +5)`,
        Number(heading)
      );
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
      this.withFilter(
        "Mn",
        `ob_model in (SELECT mo_id FROM fgs_models WHERE mo_name like ${this.currentParamIndex()})`,
        `%${name}%`
      );
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
      this.withFilter(
        "Mg",
        `ob_model in (SELECT mo_id FROM fgs_models WHERE mo_shared = ${this.currentParamIndex()})`,
        Number(modelgroup)
      );
    }
    return this;
  }
  forObjectgroup(groupid) {
    if (groupid !== undefined && isNumber(groupid)) {
      this.withFilter("Og", `ob_group = ${this.currentParamIndex()}`, Number(groupid));
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
    if (order !== undefined && isNumber(order.column)) {
      const order_cols = {
        1: "ob_id",
        2: "ob_text",
        3: "ob_country",
        4: "ob_model",
        5: "ob_modified",
        6: "ob_shared",
        7: "ob_tile",
      };

      const order_col = order_cols[toNumber(order.column)] || "mo_modified";
      const order_dir = order.dir === "asc" ? "ASC" : "DESC";
      this.orderBy = `${order_col} ${order_dir}`;
      this.queryName += 'Sort ' + order.column;
    }
    return this;
  }
  makeQuery() {
    return {
      name: this.queryName + this.queryParams.length,
      text:
        "SELECT ob_id, ob_text, ob_country, ob_model, ST_Y(wkb_geometry) AS ob_lat, ST_X(wkb_geometry) AS ob_lon, \
                   ob_heading, ob_gndelev, ob_elevoffset, mo_shared, mg_id, mg_name, mo_name, gp_id, gp_name, \
                   trim(co_code) as co_code, trim(co_name) as co_name, trim(co_three) as co_three, \
                   concat('Objects/', fn_SceneDir(wkb_geometry), '/', fn_SceneSubDir(wkb_geometry), '/') AS obpath, ob_tile \
            FROM fgs_objects \
            LEFT JOIN fgs_models on fgs_models.mo_id = fgs_objects.ob_model \
            LEFT JOIN fgs_modelgroups on fgs_models.mo_shared = fgs_modelgroups.mg_id \
            LEFT JOIN fgs_groups ON ob_group=gp_id \
            LEFT JOIN fgs_countries ON ob_country = co_code \
            WHERE " +
        ["1=1", ...this.queryFilters].join(" AND ") +
        " ORDER BY " + this.orderBy +
        this.queryPaging,
      values: this.queryParams,
    };
  }
}
exports.ObjectSearchQuery = ObjectSearchQuery;
