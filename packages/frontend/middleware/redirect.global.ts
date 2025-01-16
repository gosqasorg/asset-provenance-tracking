export default defineNuxtRouteMiddleware((to: any, from: any) => {
    // Redirect /device/:key to /record/:key
    if (to.path.startsWith('/device/')) {
        return navigateTo(to.path.replace('/device/', '/record/'))
    }

    // Redirect /provenance/:key to /history/:key
    if (to.path.startsWith('/provenance/')) {
        return navigateTo(to.path.replace('/provenance/', '/history/'))
    }
})
