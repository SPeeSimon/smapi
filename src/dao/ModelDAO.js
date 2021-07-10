const { Query } = require("../dao/pg");
/**
 * Model Data Access Object implementation for PostgreSQL
 *
 * Database layer to access models from PostgreSQL database
 *
 * @copyright  2021 - FlightGear Team
 * @license    http://www.gnu.org/licenses/gpl-2.0.html  GNU General Public License, version 2
 */

class ModelDAO {
  addModel(model) {
    return Query({
      name: "Insert Model",
      text: "INSERT INTO fgs_models (mo_id, mo_path, mo_author, mo_name, mo_notes, mo_thumbfile, mo_modelfile, mo_shared, mo_modified) \
                    VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, now()) \
                    RETURNING mo_id",
      values: [
        model.path,
        Number(model.author.id),
        model.name,
        model.notes,
        model.thumbfile,
        model.modelfile,
        Number(model.shared),
        // model.path, Number(model.author.id), model.name, model.notes, model.thumbfile, model.modelfiles.package, Number(model.modelsgroup.id)
      ],
    }).then((result) => {
      if (0 == result.rows.length) {
        throw new Error("model not created");
      }
      return Object.assign({}, model, { id: result.rows[0].mo_id });
    });
  }

  updateModel(model) {
    return Query({
      name: "Update Model",
      text: "UPDATE fgs_models SET \
                    mo_path = $1, \
                    mo_author = $2,  \
                    mo_name = $3,  \
                    mo_notes = $4,  \
                    mo_thumbfile = $5,  \
                    mo_modelfile = $6,  \
                    mo_shared = $7 \
                    WHERE mo_id = $8",
      values: [
        model.path,
        Number(model.author.id),
        model.name,
        model.notes,
        model.thumbfile,
        model.modelfile,
        Number(model.shared),
        model.id,
        // model.path, Number(model.author.id), model.name, model.notes, model.thumbfile, model.modelfiles.package, Number(model.modelsgroup.id)
        // model.filename,
        // model.author.id,
        // model.name,
        // model.description,
        // base64_encode(model.thumbnail),
        // base64_encode(model.modelFiles.package),
        // model.modelsGroup.id,
        // model.Id,
      ],
    }).then((result) => {
      if (0 == result.rowCount) {
        throw new Error("Updating model failed!");
      }
      return model;
    });
  }

  getModel(modelId) {
    return Query({
      name: "ModelDetail",
      text: "select mo_id,mo_path,mo_modified,mo_author,mo_name,mo_notes,mo_modelfile,mo_shared,mg_id,mg_name,au_id,au_name \
                FROM fgs_models \
                LEFT JOIN fgs_modelgroups on fgs_models.mo_shared = fgs_modelgroups.mg_id \
                LEFT JOIN fgs_authors on mo_author=au_id \
                where mo_id = $1",
      values: [modelId],
    }).then((result) => {
      if (0 == result.rows.length) {
        throw new Error(`Model ${modelId} not found!`);
      }
      return this.getModelFromRow(result.rows[0]);
    });
  }


  // addModelMetadata($modelMetadata) {
  //     //TODO
  // }

  // updateModelMetadata($modelMetadata){
  //     //TODO
  // }

  searchModel(modelSeachQuery) {
    const query = modelSeachQuery.makeQuery();
    return Query(query).then((result) => result.rows.map((row) => this.getModelFromRow(row)));
  }

  searchModelMetadata(modelSeachQuery) {
    const query = modelSeachQuery.makeQuery();
    return Query(query).then((result) => result.rows.map((row) => this.getModelMetadataFromRow(row)));
  }

  getModelMetadata(modelId) {
    return Query({
      name: "ModelMetadata per id",
      text: "SELECT mo_id, mo_path, mo_name, mo_notes, mo_shared, mo_modified, mg_id, mg_name, mg_path, au_id, au_name, au_email, au_notes \
                    FROM fgs_models \
                    LEFT JOIN fgs_modelgroups on fgs_models.mo_shared = fgs_modelgroups.mg_id \
                    LEFT JOIN fgs_authors on mo_author=au_id \
                    WHERE mo_id = $1",
      values: [modelId],
    }).then((result) => {
      if (result.rowCount == 1){
        return this.getModelMetadataFromRow(result.rows[0]);
      }
      return null;
    });
  }

  getModelMetadataFromPath($modelPath) {
    return Query({
      name: "ModelMetadata per path",
      text: "SELECT mo_id, mo_path, mo_name, mo_notes, mo_shared, mo_modified, mg_id, mg_name, mg_path, au_id, au_name, au_email, au_notes \
                    FROM fgs_models \
                    LEFT JOIN fgs_modelgroups on fgs_models.mo_shared = fgs_modelgroups.mg_id \
                    LEFT JOIN fgs_authors on mo_author=au_id \
                    WHERE mo_path = $1",
      values: [modelPath],
    }).then((result) => {
      if (0 == result.rowCount) {
        throw new Error(`Model ${modelPath} not found!`);
      }
      return result.rows.map(row => this.getModelMetadataFromRow(row));
    });
  }

  getModelMetadataFromSTGName(modelName) {
    const tabPath = modelName.split("/"); // Explodes the fields of the string separated by /
    const queriedModelPath = tabPath[tabPath.length - 1]; // Returns the last field value.
    return this.getModelMetadataFromPath(queriedModelPath);
  }

  getModelsMetadata(limit, offset) {
    return Query({
      name: "ModelsList",
      text: "SELECT mo_id, mo_path, mo_name, mo_notes, mo_shared, mo_modified, mg_id, mg_name, mg_path, au_id, au_name, au_email, au_notes \
                  FROM fgs_models \
                  LEFT JOIN fgs_modelgroups on fgs_models.mo_shared = fgs_modelgroups.mg_id \
                  LEFT JOIN fgs_authors on mo_author=au_id \
                  order by mo_modified desc \
                  limit $1 offset $2 ",
      values: [limit, offset],
    }).then((result) => {
      return result.rows.map(row => this.getModelMetadataFromRow(row));
    });
  }

  countTotalModels() {
    return Query({
      name: "Count Models",
      text: "SELECT COUNT(*) AS number FROM fgs_models",
    }).then((result) => result.rows[0].number);
  }

  countModelsNoThumb() {
    return Query({
      name: "Count ModelsNoThumbfile",
      text: "SELECT COUNT(*) AS number FROM fgs_models WHERE mo_thumbfile IS NULL",
    }).then((result) => result.rows[0].number);
  }

  getModelFromRow(row) {
    // $model = new \model\Model();
    return {
      metadata: this.getModelMetadataFromRow(row),
      modelFiles: row["mo_modelfile"],
      thumbnail: row["mo_thumbfile"],
    };
  }

  getModelsGroupFromRow(row) {
    // new ModelsGroup();
    return {
      id: Number(row.mg_id),
      name: row.mg_name,
      path: row.mg_path,
    };
  }

  getModelMetadataFromRow(row) {
    // $author = new \model\Author();
    // $modelMetadata = new \model\ModelMetadata();
    return {
      id: Number(row["mo_id"]),
      author: {
        id: Number(row["au_id"]),
        name: row["au_name"],
        email: row["au_email"],
        description: row["au_notes"],
      },
      filename: row["mo_path"],
      name: row["mo_name"],
      description: row["mo_notes"],
      modelsGroup: this.getModelsGroupFromRow(row),
      lastUpdated: row["mo_modified"],
    };
  }

  getPaths() {
    return Query({
      name: "ModelsPath",
      text: "select mo_id,mo_path from fgs_models ORDER BY mo_path ASC",
    }).then((result) => {
      const val = new Map();
      result.rows.foreach((row) => val.set(row.mo_id, row.mo_path));
      return val;
    });
  }

  getModelsGroup(groupId) {
    return Query({
      name: "ModelGroupsRead",
      text: "select mg_id, mg_name from fgs_modelgroups where mg_id = $1",
      values: [groupId],
    }).then((result) => {
      if (result.rows.length === 0) {
        throw Error(`Modelsgroup ${groupId} not found!`);
      }
      return this.getModelsGroupFromRow(result.rows[0]);
    });
  }

  getModelsGroupByPath(groupPath) {
    return Query({
      name: "ModelGroupsRead",
      text: "select mg_id, mg_name from fgs_modelgroups where mg_path = $1",
      values: [groupPath],
    }).then((result) => {
      if (result.rows.length === 0) {
        throw Error(`Modelsgroup ${groupPath} not found!`);
      }
      return this.getModelsGroupFromRow(result.rows[0]);
    });
  }

  getModelsGroups() {
    return Query({
      name: "ModelgroupList",
      text: "select mg_id, mg_name, mg_path from fgs_modelgroups order by mg_name",
    }).then((result) => result.rows.map(this.getModelsGroupFromRow));
  }

  getModelFiles(modelId) {
    return Query({
      name: "ModelsTarball",
      text: "select mo_path, mo_modelfile, mo_modified from fgs_models where mo_id = $1",
      values: [modelId],
    }).then((result) => {
      if (0 == result.rows.length) {
        //   return response.status(404).send("model not found");
        return null;
      }
      if (result.rows[0].mo_modelfile == null) {
        //   return response.status(404).send("no modelfile");
        return null;
      }

      return {
        modelfile: result.rows[0].mo_modelfile,
        path: result.rows[0].mo_path,
        modified: result.rows[0].mo_modified,
      };
    });
  }

  getThumbnail(modelId) {
    return Query({
      name: "ModelsThumb",
      text: "select mo_thumbfile,mo_modified from fgs_models where mo_id = $1",
      values: [modelId],
    }).then((result) => {
      if (0 == result.rows.length) {
        //   return response.status(404).send("model not found");
        return null;
      }
      if (result.rows[0].mo_thumbfile == null) {
        // return response.status(404).send("no thumbfile");
        return null;
      }

      return {
        thumbfile: result.rows[0].mo_thumbfile,
        modified: result.rows[0].mo_modified,
      };
    });
  }
}

module.exports = { ModelDAO };
