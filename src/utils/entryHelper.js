const axios = require('axios').default

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
 * @returns {number}
 */
 module.exports.getEntryWithVersion = (data, ct_uid, entry_uid, locale, version) => {
    return axios.get(`${data.host}/v3/content_types/${ct_uid}/entries/${entry_uid}`, {
        headers: {
            api_key: data.apiKey,
            authorization: data.managementToken
        },
        params: {
            locale,
            version
        }
    }).then((res) => {
        return res.data && res.data.entry
    })
}