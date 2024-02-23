# GOSQAS GDT Azure Backend 

This folder contains the GOSQAS GDT backend services, implemented using Azure
[Functions](https://azure.microsoft.com/en-us/products/functions/) and 
[Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs/).
To run this GDT functions locally, you will need:

* [NodeJS](https://nodejs.org/) v20 or later
  * Latest NodeJS LTS version preferred. 
* [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local)
* [Azure Functions for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions) (needed for debugging)
* [Azurite Storage Emulator](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=npm#install-azurite) or [Azurite Extension for VSCode](https://marketplace.visualstudio.com/items?itemName=Azurite.azurite) (needed for emulating Azure Blob Storage locally)
* [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) (needed for deployment)

## Blob Storage

GOSQAS GDT stores encrypted provenance records and attachments in 
[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs/).
The GDT functions can be configured to use either a production Azure Storage account or 
an emulated Azure Storage service running locally. 

### Local Azurite Storage Emulation

By default, GOSQAS GDT functions connect to emulated Azure Blob Storage running on localhost.
Before launching the Azure Function host, you need to start Azurite, the Azure Storage Emulator.

If you installed the Azurite VSCode extension, you can start the emulator via the `Azurite: Start`
VSCode command. Other commands of note are `Azurite: Close` to stop the emulator 
and `Azurite: Clean` to remove all the data in the emulator. More details are available in the 
[extension documentation](https://marketplace.visualstudio.com/items?itemName=Azurite.azurite#visual-studio-code-extension).

If you installed Azurite on the command line, you can launch the emulator by creating 
an empty directory and running `azurite --location <directory path>`. More details are 
available in the [Azurite documentation](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=npm%2Cblob-storage#run-azurite)

### Production Azure Storage

To configure GOSQAS GDT functions to connect to a production Azure Storage account,
you need to configure the `AZURE_STORAGE_ACCOUNT_NAME` and `AZURE_STORAGE_ACCOUNT_KEY` 
values in the [local.settings.json](packages/backend/local.settings.json) file.
Instructions on retrieving the storage account name and key via the Azure portal or
command line tools are available via in the 
[Azure Storage documentation](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-cli#view-account-access-keys)
 
## Local Function Execution

Once azurite is running or the local.settings.json file has been updated with the 
name and key for a production Azure Storage account, you can run and debug the function app

### VSCode Debugging

You can start the function host from inside of VSCode via the `start backend host` task 
or the `Attach to Backend (Azure Functions)` debug launch configuration.

### Command Line Execution

You can start the funcion host on the command line by running `npm run start` from
the `packages/backend` repo directory. This NPM script will automatically build and run
 the GDT function app. The output of this script will look something like this:

```shell
>  npm run start

# Build output omitted

Azure Functions Core Tools
Core Tools Version:       4.0.5530 Commit hash: N/A +c8883e7f3c06e2b424fbac033806c19d8d91418c (64-bit)
Function Runtime Version: 4.28.5.21962

Functions:
        getAttachment: [GET] http://localhost:7071/api/attachment/{deviceKey}/{attachmentID}
        getProvenance: [GET] http://localhost:7071/api/provenance/{deviceKey}
        postProvenance: [POST] http://localhost:7071/api/provenance/{deviceKey}
```

### Testing

The `packages/backend/test` repo folder contains a simple test to store or
retrieve provenance information via the GDT functions. This simple test is
invoked via the `npm run test` script. This script supports the following 
command line options:

> Note, you need double dashes after `npm run test` in order to pass the
> command line options to the test script. i.e. `npm run test -- --put`

By default, the test script retrieves the provenance information for a
hardcoded device ID. You can change this to store sample provenance records
and attachments via the `--put/-p` command line option.

By default, the test script uses the GDT functions running locally on the
machine. You can change this to use the cloud deployed functions running
on `gosqasbe.azurewebsites.net` via the `--cloud/-c` command line option.

## Cloud Deployment

The following commands were used to deploy a test version of GDT functions
to a function app running on gosqasbe.azurewebsites.net.

> Note, these steps assume you've logged into your Azure account via `az login`

``` shell
az group create --name rg-gdt-test --location westus2

az storage account create --name gdtteststorage --location westus2 --resource-group rg-gdt-test --sku Standard_LRS --allow-blob-public-access true

az functionapp create --resource-group rg-gdt-test  --consumption-plan-location westus2 --runtime node --runtime-version 20 --functions-version 4 --name gosqasbe --storage-account gdtteststorage

az functionapp config appsettings set --name gosqasbe --resource-group rg-gdt-test --settings AZURE_STORAGE_ACCOUNT_NAME=$storageName AZURE_STORAGE_ACCOUNT_KEY=$storagekey

func azure functionapp publish gosqasbe
 ```