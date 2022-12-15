const _ = require('lodash')
const { v4 } = require('uuid')
/**
 * 
 * @param {} CT
 * @returns {{[key:string]: boolean}}
 */
module.exports.getAllRTEPathForCT = (schema) => {
    if (!_.isArray(schema) || _.isEmpty(schema)) {
        return {}
    }
    const isRTE = (field) => {
        return field.data_type === "json" && field.field_metadata && field.field_metadata.allow_json_rte
    }
    return getPaths(schema, isRTE);
}

/**
 * 
 * @param {} CT
 * @returns {{[key:string]: boolean}}
 */
module.exports.getAllFilePathForCT = (schema) => {
    if (!_.isArray(schema) || _.isEmpty(schema)) {
        return {}
    }
    const isFileField = (field) => {
        return field.data_type === "file"
    }
    return getPaths(schema, isFileField);
}
const isBlank = (value) => {
    return _.isEmpty(value) || _.isNil(value)
}

function getPaths(schema, cb) {
    var paths = {};

    function genPath(prefix, path) {
        return isBlank(prefix) ? path : [prefix, path].join(".");
    }

    function traverse(fields, path) {
        path = path || "";
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            var currPath = genPath(path, field.uid);

            if (cb(field)) paths[currPath] = true

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
    if (path === "") {
        Q.forEach(callback);
        return
    }
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

module.exports.isRTEValid = function isRTEValid(doc) {
    if (_.isArray(doc)) {
        return doc.every((rte) => checkRTEDoc(rte))
    } else {
        return checkRTEDoc(doc)
    }
}

const requiredProperties = ["uid", "type", "attrs", "children"]

function checkRTEDoc(doc) {
    if (!_.isPlainObject(doc)) {
        return false
    }
    const hasRequiredProperties = requiredProperties.every((key) => doc.hasOwnProperty(key))
    if (!hasRequiredProperties || doc.type !== "doc") {
        return false
    }
    return doc.children.every(checkChildren)
}

function checkChildren(block) {
    if (block.hasOwnProperty('text')) {
        return true
    }
    const isChildrenValid = Array.from(block.children || []).every(checkChildren)
    const hasRequiredProperties = requiredProperties.every((key) => block.hasOwnProperty(key))
    if(!isChildrenValid || !hasRequiredProperties || block.type === "error-block"){
        return false
    }
    return true
}

const setDirtyandChangeUid = (block, options = {}) => {
    if (block.hasOwnProperty('text')) {
        return block
    }
    let children = Array.from(block.children || []).map((child) => setDirtyandChangeUid(child, options)).flat()
    if (block.hasOwnProperty('type')) {
        if(options.changeUid){
            block.uid = v4().split('-').join('')
        }
        _.set(block, ['attrs', 'dirty'], true)
    }
    block.children = children
    return block
}
module.exports.setDirtyandChangeUid = setDirtyandChangeUid
