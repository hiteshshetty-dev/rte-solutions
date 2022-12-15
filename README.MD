## How to run verification script

1. create `.env` by cloning `.env.sample` and add required details.
2. Run `npm i`
3. Run `npm run getInvalidRTEEntries`

> Once we execute this query, Content in `results/getInvalidRTEEntries.json` file would be updated and it would contain details about invalid RTE in entries

Structure of `getInvalidRTEEntries.json`

```json
{
    "content_type_uid": {
        "entry_uid": {
            "locale": {
                "entry_version": {
                    "path_to_rte": {
                        "latestRTEDocument": [],
                        "revisionRTEDocument": []
                    }
                }
            }
        }
    }
}

```
 
 
## How to run fix entry script

> Create management token with write access

> If rte was created with same uid's then update `CHANGE_RTE_UID` to `true` in `.env`

> Please make sure that `results/getInvalidRTEEntries.json` contains error context before running this script.

1. create `.env` by cloning `.env.sample` and add required details.
2. Run `npm i`
3. Run `npm run fixInvalidRTEEntries`

> Once we execute this query, Content in `results/fixInvalidRTEEntries.json` file would be updated and it would contain status of all entry update performed by script.

Structure of `fixInvalidRTEEntries.json`

```json
{
    "success": {
        "content_type_uid": {
            "entry_uid": {
                "beforeUpdate": {},
                "requestBody": {},
                "responseBody": {}
            }
        }
    },
    "error": {
        "content_type_uid": {
            "entry_uid": {
                "beforeUpdate": {},
                "requestBody": {},
                "responseBody": {}
            }
        }
    },
}
```

> After running script, please check if `error` object is created in `results/fixInvalidRTEEntries.json` file.
