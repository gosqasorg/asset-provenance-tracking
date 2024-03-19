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
});
