const _ = require('lodash')
const fs = require('fs');
const path = require('path')

const fieldWithInvalidRTEPath = path.join(__dirname, '../results', `getInvalidRTEEntries.json`)

require('dotenv').config();
const { delay } = require('./utils/delay');
const { getCTCount, getAllCTInStack } = require('./utils/contentTypeHelper');
const { getEntryCount, getBatchEntries, getEntryWithVersion } = require('./utils/entryHelper');
const { getAllLocaleInStack } = require('./utils/stackHelper');
const { getAllRTEPathForCT, getFieldValueFromPath } = require('./utils/rteHelper');

// 1 - 100
const Limit = 20
const delayTime = process.env.DELAY || 100
var getInvalidRTEEntries = async function () {
    console.info("<==== getInvalidRTEEntries: Script started ====>")
    const result = {}
    var config = {
        apiKey: process.env.CONTENTSTACK_API_KEY,
        managementToken: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
        host: process.env.CONTENTSTACK_API_HOST
    };

    const CTCount = await getCTCount(config)

    const allLocaleInStack = await getAllLocaleInStack(config)

    const BatchCTCount = Math.ceil(CTCount / Limit)
    for (let count = 0; count < BatchCTCount; count++) {
        await delay(delayTime)
        const CTs = await getAllCTInStack(config, Limit, count * Limit)
        for (const CT of CTs) {
            console.info(`  For ${CT.uid} content_type, `)

            await delay(delayTime)
            const allRTEPaths = getAllRTEPathForCT(CT.schema || [])
            if (_.isEmpty(allRTEPaths)) {
                continue
            }
            for (const locale of allLocaleInStack) {
                await delay(delayTime)
                const entryCount = await getEntryCount(config, CT.uid, locale.code)
                if (!entryCount) {
                    continue
                }
                console.info(`      For ${locale.code} locale, `)
                const entryBatchCount = Math.ceil(entryCount / Limit)
                for (let entryBatchCounter = 0; entryBatchCounter < entryBatchCount; entryBatchCounter++) {
                    await delay(delayTime)
                    const batchedEntries = await getBatchEntries(config, CT.uid, locale.code, Limit, entryBatchCounter * Limit)

                    for (const latestEntry of batchedEntries) {
                        console.info(`          For ${latestEntry.uid} entry, `)
                        await delay(delayTime)
                        const revisionEntry = await getEntryWithVersion(config, CT.uid, latestEntry.uid, locale.code, latestEntry._version)

                        for (const rtePath in allRTEPaths) {
                            let latestRTEDocument = []
                            let revisionRTEDocument = []
                            console.info(`              For ${rtePath} path, `)

                            getFieldValueFromPath(latestEntry, rtePath, (fieldValue) => {
                                latestRTEDocument.push(fieldValue)
                            })
                            getFieldValueFromPath(revisionEntry, rtePath, (fieldValue) => {
                                revisionRTEDocument.push(fieldValue)
                            })
                            if (!_.isEqual(latestRTEDocument, revisionRTEDocument)) {
                                // console.error({ "message": "There exists invalid document for JSON RTE", "metadata": { ctUid: CT.uid, entryUid: latestEntry.uid, locale: locale.code, rtePath: rtePath, version: latestEntry._version } })
                                console.info("                  There exists invalid document for JSON RTE")
                                _.setWith(result, [CT.uid, latestEntry.uid, locale.code, String(latestEntry._version), rtePath], {latestRTEDocument, revisionRTEDocument}, Object)
                            } else {
                                console.info("                  Current RTE field has proper document for JSON RTE")
                            }
                        }
                    }
                }
            }
            console.info(``)
        }
    }
    let data = JSON.stringify(result, null, 2)
    // if (!_.isEmpty(result)) {
    //     console.error({ "message": "There exists few entries with Incorrect RTE content", data })
    // }
    fs.writeFileSync(fieldWithInvalidRTEPath, data, (err) => {
        if (err) throw err;
    })
    console.info("<==== getInvalidRTEEntries: Script ended ====>")
};
getInvalidRTEEntries();
