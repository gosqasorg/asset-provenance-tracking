#!/bin/bash
# deploy_test_fe.sh
# set top level variables describing how/where function app is deployed
export LOCATION=westus2
export RG_NAME=rg-gdt-test
export STG_NAME=gdtteststorage
export AZURE_STORAGE_ACCOUNT_NAME=gdtteststorage

# Get storage account key
az login
export AZURE_STORAGE_ACCOUNT_KEY=$(az storage account keys list  --account-name $STG_NAME --resource-group $RG_NAME | jq '.[0].value')

# Note: This is really the name of the function, which serves as the backend
export FUNC_NAME=gosqasbe
export MY_STATIC_WEB_APP_NAME=gosqas-frontend

export BACKEND_URL=https://gosqasbe.azurewebsites.net/api
export FRONTEND_URL=https://red-stone-00f5d251e.5.azurestaticapps.net/

# Build
cd packages/frontend
rm -rf .nuxt .output
npm run build

# Deploy                                                                       # Not actually production. Tells azure not to edit the url. 
swa deploy .output/public/ --app-name=$MY_STATIC_WEB_APP_NAME --no-use-keychain --env production
