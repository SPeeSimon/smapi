const { isNumber, isString, toNumber } = require("../utils/validations");

const DEFAULT_LIMIT = 20;
const OFFSET_START = 0;
const DATE_REGEXP = /[0-9]{4}-[0-1][0-9]-[0-3][0-9]/; // regexp for date formatted: yyyy-mm-dd


class ModelSearchQuery {
  queryName = "SearchModelBy";
  queryParams = [];
  queryFilters = [];
  queryPaging = "";
  orderBy = "mo_modified DESC";

  constructor() { }

  currentParamIndex() {
    return this.queryParams.length + 1;
  }

  forFile(file) {
    if (isString(file)) {
      this.withFilter("F", `mo_path like $${this.currentParamIndex()}`, file);
    }
    return this;
  }
  forName(name) {
    if (isString(name)) {
      this.withFilter("Mn", `mo_name like $${this.currentParamIndex()}`, name);
    }
    return this;
  }
  forNotes(notes) {
    if (isString(notes)) {
      this.withFilter("N", `mo_notes like $${this.currentParamIndex()}`, notes);
    }
    return this;
  }
  forCountry(country) {
    if (isString(country)) {
      this.withFilter("N", `mo_id in (select ob_model FROM fgs_objects WHERE ob_country = $${this.currentParamIndex()})`, country);
    }
    return this;
  }
  forModifedOn(modified) {
    if (modified !== undefined && DATE_REGEXP.test(modified)) {
      this.withFilter("MO", `date_trunc('DAY', mo_modified) = $${this.currentParamIndex()}`, modified);
    }
    return this;
  }
  forModifiedSince(modified) {
    if (modified !== undefined && DATE_REGEXP.test(modified)) {
      this.withFilter("MS", `mo_modified >= $${this.currentParamIndex()}`, modified);
    }
    return this;
  }
  forModifiedBefore(modified) {
    if (modified !== undefined && DATE_REGEXP.test(modified)) {
      this.withFilter("MB", `mo_modified < $${this.currentParamIndex()}`, modified);
    }
    return this;
  }
  forModelgroup(modelgroup) {
    if (modelgroup !== undefined && isNumber(modelgroup)) {
      this.withFilter("Mg", `mo_shared = $${this.currentParamIndex()}`, modelgroup);
    }
    return this;
  }
  forObjectId(objectId) {
    if (objectId !== undefined && isNumber(objectId)) {
      this.withFilter(
        "O",
        `mo_id in (select ob_model FROM fgs_objects WHERE ob_id = $${this.currentParamIndex()})`,
        objectId
      );
    }
    return this;
  }
  forAuthor(author) {
    if (isString(author)) {
      this.withFilter(
        "Au",
        `(mo_author in (select au_id from fgs_authors where au_name like $${this.currentParamIndex()}) OR mo_modified_by in (select au_id from fgs_authors where au_name like $${this.currentParamIndex()}))`,
        author
      );
    }
    return this;
  }
  forAuthorId(authorId) {
    if (isNumber(authorId)) {
      this.withFilter("Ai", `(mo_author = $${this.currentParamIndex()} OR mo_modified_by = $${this.currentParamIndex()})`, authorId);
    }
    return this;
  }
  forThumbnail(thumbnail) {
    if (thumbnail === "true") {
      this.queryName += "T,";
      this.queryFilters.push("mo_thumbfile is not null");
    } else if (thumbnail === "false") {
      this.queryName += "NT,";
      this.queryFilters.push("mo_thumbfile is null");
    }
    return this;
  }
  withFilter(name, condition, param) {
    this.queryName += name + ",";
    this.queryFilters.push(condition);
    this.queryParams.push(param);
  }
  withPaging(limit, offset) {
    this.queryPaging += ` limit $${this.currentParamIndex()}`;
    if (limit && isNumber(limit)) {
      this.queryParams.push(limit);
    } else {
      this.queryParams.push(DEFAULT_LIMIT);
    }
    this.queryPaging += ` offset $${this.currentParamIndex()}`;
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
        1: "mo_id",
        2: "mo_name",
        3: "mo_path",
        4: "mo_notes",
        5: "mo_modified",
        6: "mo_shared",
      };

      const order_col = order_cols[toNumber(order.column)] || "mo_modified";
      const order_dir = order.dir === "asc" ? "ASC" : "DESC";
      this.queryName += 'Srt' + order.column;
      this.orderBy = `${order_col} ${order_dir}`;
    }
    return this;
  }
  makeQuery() {
    return {
      name: this.queryName + this.queryParams.length,
      text: "select * \
            FROM fgs_models \
            LEFT JOIN fgs_modelgroups on fgs_models.mo_shared = fgs_modelgroups.mg_id \
            LEFT JOIN fgs_authors on mo_author=au_id \
            WHERE " + ["1=1", ...this.queryFilters].join(" AND ") +
          ' ORDER BY ' + this.orderBy +
        this.queryPaging,
      values: this.queryParams,
    };
  }
}
exports.ModelSearchQuery = ModelSearchQuery;
