const axios = require('axios').default
const _ = require('lodash')

const { getFieldValueFromPath } = require('./rteHelper')


/**
 * 
 * @param {{host:string, apiKey: string, managementToken: string}} data
 * @param {number} limit
 * @param {number} skip
 * @returns {Promise<Array<object>>}
 */
module.exports.getBatchEntries = (data, ct_uid, locale, limit, skip) => {
    return axios.get(`${data.host}/v3/content_types/${ct_uid}/entries`, {
        headers: {
            api_key: data.apiKey,
            authorization: data.managementToken
        },
        params: {
            query: JSON.stringify({ locale: locale }),
            limit,
            skip
        }
    }).then((res) => {
        return res.data && res.data.entries
    })
}

/**
 * 
 * @param {{host:string, apiKey: string, managementToken: string}} data
 * @param {string} ct_uid
 * @param {string} locale
 * @returns {number}
 */
module.exports.getEntryCount = (data, ct_uid, locale) => {
    return axios.get(`${data.host}/v3/content_types/${ct_uid}/entries`, {
        headers: {
            api_key: data.apiKey,
            authorization: data.managementToken
        },
        params: {
            count: true,
            query: JSON.stringify({ locale: locale })
        }
    }).then((res) => {
        return res.data && res.data.entries
    })
}

/**
 * 
 * @param {{host:string, apiKey: string, managementToken: string}} data
 * @param {string} ct_uid
 * @param {string} entry_uid
 * @param {string} locale
 * @param {number} version
 * @returns {{[key:string]: any}}
 */
module.exports.getSingleEntry = (data, ct_uid, entry_uid, locale, version = null) => {
    const params = {
        locale
    }
    if (version) {
        params.version = version
    }
    return axios.get(`${data.host}/v3/content_types/${ct_uid}/entries/${entry_uid}`, {
        headers: {
            api_key: data.apiKey,
            authorization: data.managementToken
        },
        params: params
    }).then((res) => {
        return res.data && res.data.entry
    })
}

/**
 * 
 * @param {*} entryObject 
 * @param {{[key:string]:boolean}} filePath 
 */
module.exports.replaceFileObjectWithUID = (entryObject, filePath) => {
    for (const path in filePath) {
        const fileFieldPath = path.split('.');
        const fileUid = fileFieldPath[fileFieldPath.length - 1];
        const parentFileFieldPath = fileFieldPath.slice(0, fileFieldPath.length - 1).join('.');
        getFieldValueFromPath(entryObject, parentFileFieldPath, (parentValue) => {
            if(!parentValue){
                return
            }
            if (_.isArray(parentValue)) {
                for (const instance of parentValue) {
                    const fileValue = instance[fileUid]
                    if (!fileValue) {
                        continue
                    }
                    if (_.isArray(fileValue)) {
                        instance[fileUid] = fileValue.map((file) => file.uid)
                    } else {
                        instance[fileUid] = fileValue.uid
                    }
                }
            } else {
                const fileValue = parentValue[fileUid]
                if (!fileValue) {
                    return
                }
                if (_.isArray(fileValue)) {
                    parentValue[fileUid] = fileValue.map((file) => file.uid)
                } else {
                    parentValue[fileUid] = fileValue.uid
                }
            }
        })
    }
}

/**
 * 
 * @param {{host:string, apiKey: string, managementToken: string}} config
 * @param {string} ct_uid
 * @param {string} entry_uid
 * @param {string} locale
 * @param {{[key:string]: any}} data
 * @returns {{[key:string]: any}}
 */
module.exports.updateSingleEntry = (config, ct_uid, entry_uid, locale, data) => {
    return axios.put(`${config.host}/v3/content_types/${ct_uid}/entries/${entry_uid}`, data, {
        headers: {
            api_key: config.apiKey,
            authorization: config.managementToken
        },
        params: {
            locale
        }
    }).then((res) => {
        return res.data
    })
}