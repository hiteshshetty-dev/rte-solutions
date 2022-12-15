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
/**
 * 
 * @returns {{host:string, apiKey: string, managementToken: string}}
 */
module.exports.getConfig = () => {
    var config = {
        apiKey: process.env.CONTENTSTACK_API_KEY,
        managementToken: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
        host: process.env.CONTENTSTACK_API_HOST
    };

    const requireKey = {
        apiKey: "CONTENTSTACK_API_KEY",
        managementToken: "CONTENTSTACK_MANAGEMENT_TOKEN",
        host: "CONTENTSTACK_API_HOST"
    }

    for (const key in requireKey){
        if(!config[key]){
            throw new Error(`Missing config: ${requireKey[key]} is required`)
        }
    }
    return config
}