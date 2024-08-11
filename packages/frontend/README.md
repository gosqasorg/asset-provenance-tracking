© 2024 Global Open Source Quality Assurance System. All rights reserved.
We are committed to keeping our code open source, but all GOSQUAS and GDT 
branding, including logos, is subject to the copyright above.

# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

We have a clean separation between our frontend and backend.
This means that the URL to the backend API must be specified to Nuxt.
This is best done use an environment variable. Our Nuxt configuration
file looks for BACKEND_URL.
```
    BACKEND_URL=http://localhost:7071/api
```
If you let this to value given by Azure when you run the backend,
    with:
```
npm start
```
...then you will be running locally, instead of a cloud instance of
 of Azure. If the BACKEND_URL is not set, it should default to:
```
https://gosqasbe.azurewebsites.net/api'
```
which is wired into the nuxt.config.ts:
```
    // https://nuxt.com/docs/api/configuration/nuxt-config
const globalBaseUrl = 'https://gosqasbe.azurewebsites.net/api';

export default defineNuxtConfig({
  devtools: { enabled: true },
    css: ['~/assets/css/main.css'],
    runtimeConfig: {
    // The private keys which are only available server-side
        // Keys within public are also exposed client-side
        public: {
            baseUrl: process.env.BACKEND_URL ? process.env.BACKEND_URL : globalBaseUrl,
            apiBase: '/api'
        }
    },
})
```

To run locally you will also want to run "Azurite" for blob storage
locally, which
happily is incredibly easy to set up:
[https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=visual-studio%2Cblob-storage](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=visual-studio%2Cblob-storage).


## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Deployment to Azure

Azure Static Web Apps CLI docs: https://azure.github.io/static-web-apps-cli/

``` shell
> npx nuxi build --preset=azure
> npx @azure/static-web-apps-cli login --no-use-keychain
> npx @azure/static-web-apps-cli deploy .output/public/ --api-location .output/server/ --no-use-keychain --env production
```