const axios = require('axios').default

/**
 * 
 * @param {{host:string, apiKey: string, managementToken: string}} data
 * @returns {Array<{code:string,uid: string}>}
 */
module.exports.getAllLocaleInStack = (data) => {
    return axios.get(`${data.host}/v3/locales`, {
        headers:{
            api_key: data.apiKey,
            authorization: data.managementToken
        },
        params: {
            "only[BASE][]": "code"
        }
    }).then((res) => {
        return res.data && res.data.locales
    })
}