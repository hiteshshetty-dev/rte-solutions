const _ = require('lodash')
require('dotenv').config();
const fs = require('fs');
const path = require('path')


const invalidRTE = require('../results/getInvalidRTEEntries.json')
const { getSingleCT } = require('./utils/contentTypeHelper')
const { isRTEValid, getAllFilePathForCT, setDirtyandChangeUid, getFieldValueFromPath } = require('./utils/rteHelper')
const { delay } = require('./utils/delay');
const { getConfig } = require('./utils/stackHelper');
const { getSingleEntry, replaceFileObjectWithUID, updateSingleEntry } = require('./utils/entryHelper');


const fieldWithInvalidRTEPath = path.join(__dirname, '../results', `fixInvalidRTEEntries.json`)
const delayTime = process.env.DELAY || 100

const fixInvalidRTEEntries = async () => {
    console.info("<==== fixInvalidRTEEntries: Script started ====>")
    const result = {}
    const config = getConfig()
    const changeUid = process.env.CHANGE_RTE_UID === 'true'
    if (!Object.keys(invalidRTE).length) {
        throw new Error('No invalid rte found. Please execute `npm run getInvalidRTEEntries`')
    }
    for (const ct_uid in invalidRTE) {
        console.info(`For ${ct_uid} content_type`,)
        const CTObject = await getSingleCT(config, ct_uid)

        const filePath = getAllFilePathForCT(CTObject.schema)

        await delay(delayTime)

        const CT = invalidRTE[ct_uid]
        for (const entry_uid in CT) {
            console.info(`  For ${entry_uid} entry`,)
            const entryMap = CT[entry_uid]

            for (const locale in entryMap) {
                console.info(`      For ${locale} locale`,)
                const localeMap = entryMap[locale]
                let isLatestValid = true;
                let isRevisionValid = true;
                let requestBody, beforeUpdate;

                const entryObject = await getSingleEntry(config, ct_uid, entry_uid, locale)
                const modifedlatestObject = _.cloneDeep(entryObject)
                replaceFileObjectWithUID(modifedlatestObject, filePath)
                await delay(delayTime)

                const revisionObject = await getSingleEntry(config, ct_uid, entry_uid, locale, entryObject._version)
                const modifedRevisionObject = _.cloneDeep(revisionObject)
                replaceFileObjectWithUID(modifedRevisionObject, filePath)
                await delay(delayTime)

                for (const version in localeMap) {
                    const versionMap = localeMap[version]
                    for (const rtePath in versionMap) {
                        const pathMap = versionMap[rtePath]
                        console.info(`          For path ${rtePath}, `,)

                        let latestRTEDocument = pathMap.latestRTEDocument
                        let revisionRTEDocument = pathMap.revisionRTEDocument

                        for (let i = 0; i < latestRTEDocument.length; i++) {
                            const latest = isRTEValid(latestRTEDocument[i])
                            const revision = isRTEValid(revisionRTEDocument[i])

                            if (!latest) {
                                isLatestValid = false
                            }
                            if (!revision) {
                                isRevisionValid = false
                            }
                        }

                        if (isLatestValid) {
                            getFieldValueFromPath(modifedlatestObject, rtePath, (fieldValue) => {
                                if (!fieldValue) {
                                    return
                                }
                                if (_.isArray(fieldValue)) {
                                    fieldValue.forEach((rte) => setDirtyandChangeUid(rte, { changeUid }))
                                } else {
                                    setDirtyandChangeUid(fieldValue, { changeUid })
                                }
                            })
                        }
                        if (isRevisionValid) {
                            getFieldValueFromPath(modifedRevisionObject, rtePath, (fieldValue) => {
                                if (!fieldValue) {
                                    return
                                }
                                if (_.isArray(fieldValue)) {
                                    fieldValue.forEach((rte) => setDirtyandChangeUid(rte, { changeUid }))
                                } else {
                                    setDirtyandChangeUid(fieldValue, { changeUid })
                                }
                            })
                        }
                    }
                }
                if (!isLatestValid && !isRevisionValid) {
                    const genericPath = ["error", ct_uid, entry_uid, locale]
                    _.set(result, [...genericPath, "beforeUpdate"], entryObject)
                    _.set(result, [...genericPath, "requestBody"], modifedlatestObject)
                    _.set(result, [...genericPath, "responseBody"], {"message": "Both latest and revision of the entry is effected. Would require manual entry update."})
                    console.error(`             Both latest and revision of the entry is effected. Would require manual entry update.`)
                } else if (isLatestValid) {
                    requestBody = modifedlatestObject
                    beforeUpdate = entryObject
                } else if (isRevisionValid) {
                    requestBody = modifedRevisionObject
                    beforeUpdate = revisionObject
                }

                if (requestBody) {
                    try {
                        const responseBody = await updateSingleEntry(config, ct_uid, entry_uid, locale, { "entry": requestBody })
                        console.info(`              ${responseBody.notice}`)
                        const genericPath = ["success", ct_uid, entry_uid, locale]
                        
                        _.set(result, [...genericPath, "beforeUpdate"], beforeUpdate)
                        _.set(result, [...genericPath, "requestBody"], requestBody)
                        _.set(result, [...genericPath, "responseBody"], responseBody)
                    } catch (error) {
                        console.error(error.response && error.response.data || error.response || error)
                        const genericPath = ["error", ct_uid, entry_uid, locale]
                        _.set(result, [...genericPath, "beforeUpdate"], beforeUpdate)
                        _.set(result, [...genericPath, "requestBody"], requestBody)
                        _.set(result, [...genericPath, "responseBody"], error.response.data)
                    }

                }
            }
        }
    }
    let data = JSON.stringify(result, null, 2)

    fs.writeFileSync(fieldWithInvalidRTEPath, data, (err) => {
        if (err) throw err;
    })
    console.info("<==== fixInvalidRTEEntries: Script completed ====>")
}

fixInvalidRTEEntries()