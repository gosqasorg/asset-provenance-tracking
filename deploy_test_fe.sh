#!/bin/bash
# deploy_test_fe.sh
# set top level variables describing how/where function app is deployed
export LOCATION=eastus2
export RG_NAME=rg-gdt-test
export STG_NAME=gdtteststorage
export AZURE_STORAGE_ACCOUNT_NAME=gdtteststorage
# Run this command to get the account storage key
# az storage account keys list  --account-name $STG_NAME --resource-group $RG_NAME | jq '.[0].value'
export AZURE_STORAGE_ACCOUNT_KEY=
export FUNC_NAME=gdttestbackend
export MY_STATIC_WEB_APP_NAME=gdt-test-frontend

export BACKEND_URL=https://gdttestbackend.azurewebsites.net/api
export FRONTEND_URL=https://gosqas.org

# Deploy frontend
cd packages/frontend
npx nuxi build
swa deploy .output/public/ --app-name=$MY_STATIC_WEB_APP_NAME --no-use-keychain --env test
