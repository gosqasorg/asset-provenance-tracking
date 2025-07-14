#!/bin/bash
# deploy_test_be.sh
# set top level variables describing how/where function app is deployed
export LOCATION=eastus2
export RG_NAME=rg-gdt-test
export STG_NAME=gdtteststorage
export AZURE_STORAGE_ACCOUNT_NAME=gdtteststorage

# Get storage account keykey
az login
export AZURE_STORAGE_ACCOUNT_KEY=$(az storage account keys list  --account-name $STG_NAME --resource-group $RG_NAME | jq '.[0].value')

export FUNC_NAME=gosqasbe
export MY_STATIC_WEB_APP_NAME=gdt-test-frontend

# Deploy function app
cd packages/backend
npm install
npm run build
func azure functionapp publish $FUNC_NAME
