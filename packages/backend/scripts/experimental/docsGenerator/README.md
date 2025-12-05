- Run `./test.sh`, this will generate/update the resultant ..packages\backend\api-docs\openAPI-docs.yaml and ..\packages\frontend\public\openAPI-docs.json. 

- Paste the ..packages\backend\api-docs\openAPI-docs.yaml  into Swagger Editor: https://editor.swagger.io/

- You can change the server endpoint under `Server` banner in the dropdown.

The Swagger Editor does extensive syntax checking & issue reporting. 

**Note: Manual Overrides **

Created `packages/backend/api-docs/manual-openapi-overrides.yaml` to preserve manual documentation. The generator merges manual overrides with auto-generated specs (manual takes precedence).
