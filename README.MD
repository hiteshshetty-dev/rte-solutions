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