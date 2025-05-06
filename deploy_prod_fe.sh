#!/bin/bash
# deploy_prod_fe.sh
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

export BACKEND_URL=https://gdtprodbackend.azurewebsites.net/api
export FRONTEND_URL=https://gosqas.org

# Deploy frontend
cd packages/frontend
npx nuxi build
swa deploy .output/public/ --app-name=$MY_STATIC_WEB_APP_NAME --no-use-keychain --env production
