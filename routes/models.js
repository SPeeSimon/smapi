const express = require("express");
const Query = require("../pg");
const {isNumber, isString, toNumber} = require("../utils/validations");
const DEFAULT_LIMIT = 20;
const OFFSET_START = 0;

var router = express.Router();

router.get("/bymg/:mg/:limit?/:offset?", function (request, response, next) {
  var mg = Number(request.params.mg || 0);
  var offset = Number(request.params.offset || 0);
  var limit = Number(request.params.limit || 0);

  if (isNaN(offset) || isNaN(limit) || isNaN(mg)) {
    return response.status(500).send("Invalid Request");
  }
  limit = Math.min(10000, Math.max(1, limit));

  const query = new ModelSearchQuery()
    .forModelgroup(mg)
    .withPaging(limit, offset)
    .makeQuery();

  Query(query)
    .then((result) => {
      response.json(result.rows.map(rowToModelWithAuthor));
    })
    .catch((err) => {
      console.log("db error", err);
      return response.status(500).send("Database Error");
    });
});

router.get("/list/:limit?/:offset?", function (request, response, next) {
  var offset = Number(request.params.offset || 0);
  var limit = Number(request.params.limit || 0);

  if (isNaN(offset) || isNaN(limit)) {
    return response.status(500).send("Invalid Request");
  }

  limit = Math.min(10000, Math.max(1, limit));

  Query({
    name: "ModelsList",
    text: "select mo_id, mo_path, mo_name, mo_notes, mo_shared, mo_modified,mo_author,au_name \
          from fgs_models,fgs_authors \
          where au_id=mo_author \
          order by mo_modified desc \
          limit $1 offset $2 ",
    values: [limit, offset],
  })
    .then((result) => {
      response.json(result.rows.map(rowToModelWithAuthor));
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

router.get("/datatable", function (request, response, next) {
  var draw = toNumber(request.query.draw);
  var start = toNumber(request.query.start);
  var length = toNumber(request.query.length);

  request.query.search = request.query.search || {};
  var search = request.query.search.value || "";
  order = request.query.order || [{ column: "1", dir: "asc" }];

  var order_cols = {
    1: "mo_id",
    2: "mo_name",
    3: "mo_path",
    4: "mo_notes",
    5: "mo_modified",
    6: "mo_shared",
  };
  order_col = order_cols[toNumber(order[0].column)] || "mo_id";
  order_dir = order[0].dir === "asc" ? "ASC" : "DESC";

  //TODO: need to construct prepared statements for each order/dir combination
  var queryArgs =
    //search == '' ?
    //    {
    //      name: 'ModelsListDatatable',
    //      text: "select mo_id, mo_path, mo_name, mo_notes, mo_modified, mo_shared from fgs_models order by mo_modified desc limit $1 offset $2",
    //      values: [ length, start ]
    //    } :
    {
      name: "ModelsSearchDatatable",
      text: "select mo_id, mo_path, mo_name, mo_notes, mo_modified, mo_shared \
            from fgs_models \
            where mo_path ilike $3 or mo_name ilike $3 or mo_notes ilike $3 \
            order by mo_modified desc \
            limit $1 offset $2",
      values: [length, start, "%" + search + "%"],
    };

  Query(queryArgs)
    .then((result) => {
      var j = result.rows.map(rowToModel);

      Query({
        name: "CountModels",
        text: "select count(*) from fgs_models",
      })
        .then((result) => {
          var count = result.rows[0].count;

          response.json({
            draw: draw,
            recordsTotal: count,
            recordsFiltered: search == "" ? count : j.length,
            data: j,
          });
        })
        .catch((err) => {
          return response.status(500).send("Database Error");
        });
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

router.get("/search/:pattern", function (request, response, next) {
  Query({
    name: "ModelsSearch",
    text: "select mo_id, mo_path,mo_name,mo_notes,mo_shared,mo_modified \
          from fgs_models \
          where mo_path like $1 or mo_name like $1 or mo_notes like $1",
    values: ["%" + request.params.pattern + "%"],
  })
    .then((result) => {
      response.json(result.rows.map(rowToModel));
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

router.get("/search/", modelSearchHandler);

router.get("/search/byauthor/:id/:limit?/:offset?", function (request, response, next) {
  var id = Number(request.params.id || 0);
  var offset = Number(request.params.offset || 0);
  var limit = Number(request.params.limit || 20);

  if (!isNumber(request.params.id)) {
    return response.status(500).send("Invalid Request: id is not a valid number");
  }  

  const query = new ModelSearchQuery()
                  .forAuthorId(id)
                  .withPaging(limit, offset)
                  .makeQuery();
  Query(query)
    .then((result) => {
      response.json(result.rows.map(rowToModelWithAuthor));
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
});

function modelSearchHandler(request, response, next) {
  const query = new ModelSearchQuery()
    .forFile(request.query.file)
    .forName(request.query.name)
    .forNotes(request.query.notes)
    .forCountry(request.query.country)
    .forModifedOn(request.query.modifiedOn)
    .forModifiedBefore(request.query.modifiedBefore)
    .forModifiedSince(request.query.modifiedSince)
    .forModelgroup(request.query.modelgroup)
    .forObjectId(request.query.object)
    .forAuthor(request.query.author)
    .forAuthorId(request.query.authorId)
    .forThumbnail(request.query.thumbnail)
    .withPaging(request.query.limit, request.query.offset)
    .withOrder({column: request.query['order.column'], dir: request.query['order.dir']})
    .makeQuery();
  // console.log(query);
  Query(query)
    .then((result) => {
      response.json(result.rows.map(rowToModelWithAuthor));
    })
    .catch((err) => {
      console.log("db error", err);
      return response.status(500).send("Database Error");
    });
}

function rowToModel(row) {
  return {
    id: row.mo_id,
    filename: row.mo_path,
    name: row.mo_name,
    notes: row.mo_notes,
    shared: row.mo_shared,
    modified: row.mo_modified,
  };
}

function rowToModelWithAuthor(row) {
  return Object.assign(rowToModel(row), {
    author: row.au_name,
    authorId: row.mo_author,
  });
}

module.exports = router;

// add
("INSERT INTO fgs_models \
(mo_id, mo_path, mo_author, mo_name, mo_notes, mo_thumbfile, mo_modelfile, mo_shared) \
VALUES (DEFAULT, ?, ?, ?, ?, ?, ?, ?) RETURNING mo_id");
// update
// 'UPDATE fgs_models ';
//         $query .= "SET mo_path = '".pg_escape_string($modelMD->getFilename())."', ".
//                   "mo_author = ".pg_escape_string($modelMD->getAuthor()->getId()).", ".
//                   "mo_name = '".pg_escape_string($modelMD->getName())."', ".
//                   "mo_notes = '".pg_escape_string($modelMD->getDescription())."', ".
//                   "mo_thumbfile = '".base64_encode($model->getThumbnail())."', ".
//                   "mo_modelfile = '".base64_encode($model->getModelFiles()->getPackage())."', ".
//                   "mo_shared = ".pg_escape_string($modelMD->getModelsGroup()->getId());
//         $query .= " WHERE mo_id = ".$modelMD->getId();

class ModelSearchQuery {
  queryName = "SearchModelBy";
  queryParams = [];
  queryFilters = [];
  queryPaging = "";
  orderBy = "mo_modified DESC";

  constructor() {}

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
    if (modified !== undefined && /[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(modified)) {
      this.withFilter("MO", `date_trunc('DAY', mo_modified) = $${this.currentParamIndex()}`, modified);
    }
    return this;
  }
  forModifiedSince(modified) {
    if (modified !== undefined && /[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(modified)) {
      this.withFilter("MS", `mo_modified >= $${this.currentParamIndex()}`, modified);
    }
    return this;
  }
  forModifiedBefore(modified) {
    if (modified !== undefined && /[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(modified)) {
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
    if (order !== undefined && isNumber(order.column)){
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
      this.orderBy = `${order_col} ${order_dir}`
    }
    return this;
  }
  makeQuery() {
    return {
      name: this.queryName,
      text: "select * FROM fgs_models LEFT JOIN fgs_authors ON au_id=mo_author WHERE " + 
            ["1=1", ...this.queryFilters].join(" AND ") + 
            ' ORDER BY ' + this.orderBy + 
            this.queryPaging,
      values: this.queryParams,
    };
  }
}
