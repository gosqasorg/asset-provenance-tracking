#!/bin/bash
# deploy_prod_be.sh
# set top level variables describing how/where function app is deployed
export LOCATION=eastus2
export RG_NAME=rg-gdt-prod
export STG_NAME=gdtprodstorage
export AZURE_STORAGE_ACCOUNT_NAME=gdtprodstorage
# Run this command to get the account storage key
# az storage account keys list  --account-name $STG_NAME --resource-group $RG_NAME | jq '.[0].value'
export AZURE_STORAGE_ACCOUNT_KEY=
export FUNC_NAME=gdtprodbackend
export MY_STATIC_WEB_APP_NAME=gdt-prod-frontend

# Deploy function app
cd packages/backend
npm install
npm run build
func azure functionapp publish $FUNC_NAME
