const axios = require('axios').default

/**
 * 
 * @param {{host:string, apiKey: string, managementToken: string}} data
 * @param {number} limit
 * @param {number} skip
 * @returns {Promise<Array<{uid: string, schema: Array<object>}>>}
 */
module.exports.getAllCTInStack = (data, limit, skip) => {
    return axios.get(`${data.host}/v3/content_types`, {
        headers:{
            api_key: data.apiKey,
            authorization: data.managementToken
        },
        params: {
            query: JSON.stringify({"_metadata.references.is_rte": true }),
            include_global_field_schema: true,
            limit,
            skip
        }
    }).then((res) => {
        return res.data && res.data.content_types
    })
}

/**
 * 
 * @param {{host:string, apiKey: string, managementToken: string}} data
 * @returns {Promise<number>}
 */
module.exports.getCTCount = (data) => {
    return axios.get(`${data.host}/v3/content_types`, {
        headers:{
            api_key: data.apiKey,
            authorization: data.managementToken
        },
        params: {
            query: JSON.stringify({"_metadata.references.is_rte": true }),
            count: true
        }
    }).then((res) => {
        return res.data && res.data.content_types
    })
}
