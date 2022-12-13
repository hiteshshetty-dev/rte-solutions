const _ = require('lodash')
/**
 * 
 * @param {} CT
 * @returns {{[key:string]: boolean}}
 */
module.exports.getAllRTEPathForCT = (schema) => {
    if(!_.isArray(schema) || _.isEmpty(schema)){
        return {}
    }
    return getPaths(schema, "json");
}
const isBlank = (value) => {
    return _.isEmpty(value) || _.isNil(value)
}

function getPaths(schema, type) {
    var paths = {};

    function genPath(prefix, path) {
        return isBlank(prefix) ? path : [prefix, path].join(".");
    }

    function traverse(fields, path) {
        path = path || "";
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            var currPath = genPath(path, field.uid);

            if (field.data_type === type && field.field_metadata && field.field_metadata.allow_json_rte) paths[currPath] = true;

            if (field.data_type === "group") traverse(field.schema, currPath);

            if (
                field.data_type === "global_field" &&
                _.isUndefined(field.schema) === false &&
                _.isEmpty(field.schema) === false
            )
                //added support to show asset details for global_fields
                traverse(field.schema, currPath);
            if (field.data_type === "blocks") {
                field.blocks.forEach(function (block) {
                    if (block.schema) traverse(block.schema, currPath + "." + block.uid);
                });
            }
        }
    }

    traverse(schema);

    return paths;
}

/**
 * 
 * @param {{[key:string]:any}} entry Entry Value
 * @param {string} path Field Path
 * @param {(fieldValue:any) => void} callback Callback function
 * 
 */
 module.exports.getFieldValueFromPath = function getFieldValueFromPath(entry, path = '', callback) {
    let Q = [entry];
    path = path.split('.');
  
    for (const key of path) {
      const _Q = [];
      for (const field of Q) {
        const fields = Array.isArray(field) ? field : [field];
        for (const _field of fields) {
          if (!_field.hasOwnProperty(key)) continue;
          _Q.push(_field[key]);
        }
      }
      Q = _Q;
    }
    Q.forEach(callback);
  }
