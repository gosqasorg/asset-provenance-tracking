# GOSQAS GDT Azure Backend 

This folder contains the GOSQAS GDT backend services, implemented using Azure
[Functions](https://azure.microsoft.com/en-us/products/functions/) and 
[Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs/).
To run this code locally, you will need:

* [NodeJS](https://nodejs.org/) v18 or later
  * Latest NodeJS LTS version preferred. 
* [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local)
* [Azure Functions for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions) (needed for debugging)
* [Azurite Blob Storage Emulator](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=npm#install-azurite)
  * Alternatively, there is the [Azurite Extension for VSCode](https://marketplace.visualstudio.com/items?itemName=Azurite.azurite) if you'd rather not use a command line tool
* [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) (needed for deployment)

## Blob Storage

GOSQAS GDT stores all encrypted provenance records and attachments in Azure Blob Storage. 
The GOSQAS GDT functions will default to emulated storage unless the `AZURE_STORAGE_ACCOUNT_NAME` and `AZURE_STORAGE_ACCOUNT_KEY`
environment variables are set to production deployment values.

If you wish to test the GOSQAS GDT functions locally against emulated Blob Storage running on your local machine,
simply create a directory to store the emulated service blobs and run `azurite` in a terminal window from that directory.
Azurite the storage emulator for Azure cloud storage. 
Azurite uses the same NodeJS runtime as GOSQAS GDT, so it's easy to install via NPM.
Azurite requires no configuration -- simply run it in the terminal from the directory you created to store the emulated service blobs.

If you wish to test the GOSQAS GDT functions locally against an actual Blob Storage endpoint in the cloud,
you can add the `AZURE_STORAGE_ACCOUNT_NAME` and `AZURE_STORAGE_ACCOUNT_KEY` variables to the 
[local settings file](https://learn.microsoft.com/en-us/azure/azure-functions/functions-develop-local#local-settings-file)
to make them available to your locally running functions. 

## Local Function Execution

To run the functions locally, execute `func host start` from the `packages/backend` folder in a terminal window.
The local function host environment should start and print something similar to this output:

```shell
> func host start

[2023-11-24T19:57:55.868Z] Worker process started and initialized.
Functions:
        getAttachment: [GET] http://localhost:7071/api/attachment/{deviceKey}/{attachmentID}
        getProvenance: [GET] http://localhost:7071/api/provenance/{deviceKey}
        postProvenance: [POST] http://localhost:7071/api/provenance/{deviceKey}
```

You can start the function host from inside of VSCode via the `start backend host` task 
or the `Attach to Backend (Azure Functions)` debug launch configuration.

