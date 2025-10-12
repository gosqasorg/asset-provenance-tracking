// Copyright (C) 2024 GOSQAS Team
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/styles/main.scss'],
  runtimeConfig: {
    // The private keys which are only available server-side
    // Keys within public are also exposed client-side
    public: {
      // The backend URL defaults to staging because the current CI/CD pipeline deploys main to staging.
      // This also allows us to test frontend development with a real backend.
      // There is also a bug with Azure Functions where the env vars are not set correctly.
      // For local development, set baseUrl to http://localhost:7071/api
      baseUrl: process.env.BACKEND_URL ?? 'http://localhost:7071/api',
      frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
      handIconBackground: '/assets/images/hand-icon.png',
      environment: detectEnvironment(),
      buildDate: process.env.BUILD_DATE,
      buildVersion: process.env.BUILD_VERSION,
      gitCommit: process.env.GIT_COMMIT
    }
  },
  modules: ['@nuxt/test-utils/module', 'nuxt-snackbar', '@scalar/nuxt'],
  snackbar: {
    bottom: true,
    duration: 5000
  },
  hooks: {
    ready(nuxt) {
      // Log the app config to ensure it is correct when deployed.
      console.log(`App Config:
baseUrl: ${nuxt.options.runtimeConfig.public.baseUrl}
frontendUrl: ${nuxt.options.runtimeConfig.public.frontendUrl}`);
    }
  },
  ssr: false,
  nitro: {
    static: true
  },
  scalar: {
    url: '/openAPI-docs.json',
    darkMode: true,
    metaData: {
      title: 'GOSQAS API Documentation'
    },
    showSidebar: true
  },
  compatibilityDate: '2024-11-12'
});

// Environment detection by checking the frontend URL and NODE_ENV
function detectEnvironment(): string {
  const frontendUrl = process.env.FRONTEND_URL;
  const nodeEnv = process.env.NODE_ENV;

  const PRODUCTION_FRONTEND = 'https://blue-stone-05ede120f.5.azurestaticapps.net/'; // Production URL
  const STAGING_FRONTEND = 'https://red-stone-00f5d251e.5.azurestaticapps.net/'; // Staging URL

  if (frontendUrl === PRODUCTION_FRONTEND) {
    return 'production';
  } else if (frontendUrl === STAGING_FRONTEND) {
    return 'staging';
  }

  // Check for localhost/development patterns
  else if (frontendUrl?.includes('localhost')) {
    return 'development';
  }

  // Fall back to NODE_ENV
  return nodeEnv || 'unknown';
}
