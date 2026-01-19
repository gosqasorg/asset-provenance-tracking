
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T extends DefineComponent> = T & DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>>
type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = (T & DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }>)
interface _GlobalComponents {
      'ButtonComponent': typeof import("../components/ButtonComponent.vue")['default']
    'ButtonsHowItWorks': typeof import("../components/Buttons/HowItWorks.vue")['default']
    'ButtonsLargeToggle': typeof import("../components/Buttons/LargeToggle.vue")['default']
    'ButtonsNavButton': typeof import("../components/Buttons/NavButton.vue")['default']
    'ButtonsPilotProgram': typeof import("../components/Buttons/PilotProgram.vue")['default']
    'FormsCreateContainer': typeof import("../components/Forms/CreateContainer.vue")['default']
    'FormsCreateDevice': typeof import("../components/Forms/CreateDevice.vue")['default']
    'GenerateQRCode': typeof import("../components/GenerateQRCode.vue")['default']
    'KeyList': typeof import("../components/KeyList.vue")['default']
    'ProvenanceCreateRecord': typeof import("../components/Provenance/CreateRecord.vue")['default']
    'ProvenanceFeed': typeof import("../components/Provenance/Feed.vue")['default']
    'ProvenanceNotificationSignUpModal': typeof import("../components/Provenance/NotificationSignUpModal.vue")['default']
    'ProvenancePriorityNotices': typeof import("../components/Provenance/PriorityNotices.vue")['default']
    'ProvenanceCSV': typeof import("../components/Provenance/ProvenanceCSV.vue")['default']
    'ProvenanceShareDropdown': typeof import("../components/Provenance/ShareDropdown.vue")['default']
    'ProvenanceTagInput': typeof import("../components/Provenance/TagInput.vue")['default']
    'QRCode': typeof import("../components/QRCode.vue")['default']
    'TimestampList': typeof import("../components/TimestampList.vue")['default']
    'TrackAsset': typeof import("../components/TrackAsset.vue")['default']
    'CsvFile': typeof import("../components/csvFile.vue")['default']
    'NuxtWelcome': typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
    'NuxtLayout': typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
    'NuxtErrorBoundary': typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary")['default']
    'ClientOnly': typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
    'DevOnly': typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
    'ServerPlaceholder': typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
    'NuxtLink': typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
    'NuxtLoadingIndicator': typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
    'NuxtRouteAnnouncer': typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
    'NuxtImg': typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
    'NuxtPicture': typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
    'ScalarApiReference': typeof import("../node_modules/@scalar/nuxt/dist/runtime/components/ScalarApiReference.vue")['default']
    'NuxtPage': typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
    'NoScript': typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
    'Link': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
    'Base': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
    'Title': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
    'Meta': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
    'Style': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
    'Head': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
    'Html': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
    'Body': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
    'NuxtSnackbar': typeof import("../node_modules/nuxt-snackbar/dist/runtime/components/NuxtSnackbar.vue")['default']
    'NuxtIsland': typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
    'NuxtRouteAnnouncer': IslandComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
      'LazyButtonComponent': LazyComponent<typeof import("../components/ButtonComponent.vue")['default']>
    'LazyButtonsHowItWorks': LazyComponent<typeof import("../components/Buttons/HowItWorks.vue")['default']>
    'LazyButtonsLargeToggle': LazyComponent<typeof import("../components/Buttons/LargeToggle.vue")['default']>
    'LazyButtonsNavButton': LazyComponent<typeof import("../components/Buttons/NavButton.vue")['default']>
    'LazyButtonsPilotProgram': LazyComponent<typeof import("../components/Buttons/PilotProgram.vue")['default']>
    'LazyFormsCreateContainer': LazyComponent<typeof import("../components/Forms/CreateContainer.vue")['default']>
    'LazyFormsCreateDevice': LazyComponent<typeof import("../components/Forms/CreateDevice.vue")['default']>
    'LazyGenerateQRCode': LazyComponent<typeof import("../components/GenerateQRCode.vue")['default']>
    'LazyKeyList': LazyComponent<typeof import("../components/KeyList.vue")['default']>
    'LazyProvenanceCreateRecord': LazyComponent<typeof import("../components/Provenance/CreateRecord.vue")['default']>
    'LazyProvenanceFeed': LazyComponent<typeof import("../components/Provenance/Feed.vue")['default']>
    'LazyProvenanceNotificationSignUpModal': LazyComponent<typeof import("../components/Provenance/NotificationSignUpModal.vue")['default']>
    'LazyProvenancePriorityNotices': LazyComponent<typeof import("../components/Provenance/PriorityNotices.vue")['default']>
    'LazyProvenanceCSV': LazyComponent<typeof import("../components/Provenance/ProvenanceCSV.vue")['default']>
    'LazyProvenanceShareDropdown': LazyComponent<typeof import("../components/Provenance/ShareDropdown.vue")['default']>
    'LazyProvenanceTagInput': LazyComponent<typeof import("../components/Provenance/TagInput.vue")['default']>
    'LazyQRCode': LazyComponent<typeof import("../components/QRCode.vue")['default']>
    'LazyTimestampList': LazyComponent<typeof import("../components/TimestampList.vue")['default']>
    'LazyTrackAsset': LazyComponent<typeof import("../components/TrackAsset.vue")['default']>
    'LazyCsvFile': LazyComponent<typeof import("../components/csvFile.vue")['default']>
    'LazyNuxtWelcome': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
    'LazyNuxtLayout': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
    'LazyNuxtErrorBoundary': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary")['default']>
    'LazyClientOnly': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
    'LazyDevOnly': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
    'LazyServerPlaceholder': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
    'LazyNuxtLink': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
    'LazyNuxtLoadingIndicator': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
    'LazyNuxtRouteAnnouncer': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
    'LazyNuxtImg': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
    'LazyNuxtPicture': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
    'LazyScalarApiReference': LazyComponent<typeof import("../node_modules/@scalar/nuxt/dist/runtime/components/ScalarApiReference.vue")['default']>
    'LazyNuxtPage': LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
    'LazyNoScript': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
    'LazyLink': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
    'LazyBase': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
    'LazyTitle': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
    'LazyMeta': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
    'LazyStyle': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
    'LazyHead': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
    'LazyHtml': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
    'LazyBody': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
    'LazyNuxtSnackbar': LazyComponent<typeof import("../node_modules/nuxt-snackbar/dist/runtime/components/NuxtSnackbar.vue")['default']>
    'LazyNuxtIsland': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
    'LazyNuxtRouteAnnouncer': LazyComponent<IslandComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export const ButtonComponent: typeof import("../components/ButtonComponent.vue")['default']
export const ButtonsHowItWorks: typeof import("../components/Buttons/HowItWorks.vue")['default']
export const ButtonsLargeToggle: typeof import("../components/Buttons/LargeToggle.vue")['default']
export const ButtonsNavButton: typeof import("../components/Buttons/NavButton.vue")['default']
export const ButtonsPilotProgram: typeof import("../components/Buttons/PilotProgram.vue")['default']
export const FormsCreateContainer: typeof import("../components/Forms/CreateContainer.vue")['default']
export const FormsCreateDevice: typeof import("../components/Forms/CreateDevice.vue")['default']
export const GenerateQRCode: typeof import("../components/GenerateQRCode.vue")['default']
export const KeyList: typeof import("../components/KeyList.vue")['default']
export const ProvenanceCreateRecord: typeof import("../components/Provenance/CreateRecord.vue")['default']
export const ProvenanceFeed: typeof import("../components/Provenance/Feed.vue")['default']
export const ProvenanceNotificationSignUpModal: typeof import("../components/Provenance/NotificationSignUpModal.vue")['default']
export const ProvenancePriorityNotices: typeof import("../components/Provenance/PriorityNotices.vue")['default']
export const ProvenanceCSV: typeof import("../components/Provenance/ProvenanceCSV.vue")['default']
export const ProvenanceShareDropdown: typeof import("../components/Provenance/ShareDropdown.vue")['default']
export const ProvenanceTagInput: typeof import("../components/Provenance/TagInput.vue")['default']
export const QRCode: typeof import("../components/QRCode.vue")['default']
export const TimestampList: typeof import("../components/TimestampList.vue")['default']
export const TrackAsset: typeof import("../components/TrackAsset.vue")['default']
export const CsvFile: typeof import("../components/csvFile.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary")['default']
export const ClientOnly: typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const ScalarApiReference: typeof import("../node_modules/@scalar/nuxt/dist/runtime/components/ScalarApiReference.vue")['default']
export const NuxtPage: typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtSnackbar: typeof import("../node_modules/nuxt-snackbar/dist/runtime/components/NuxtSnackbar.vue")['default']
export const NuxtIsland: typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const NuxtRouteAnnouncer: IslandComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyButtonComponent: LazyComponent<typeof import("../components/ButtonComponent.vue")['default']>
export const LazyButtonsHowItWorks: LazyComponent<typeof import("../components/Buttons/HowItWorks.vue")['default']>
export const LazyButtonsLargeToggle: LazyComponent<typeof import("../components/Buttons/LargeToggle.vue")['default']>
export const LazyButtonsNavButton: LazyComponent<typeof import("../components/Buttons/NavButton.vue")['default']>
export const LazyButtonsPilotProgram: LazyComponent<typeof import("../components/Buttons/PilotProgram.vue")['default']>
export const LazyFormsCreateContainer: LazyComponent<typeof import("../components/Forms/CreateContainer.vue")['default']>
export const LazyFormsCreateDevice: LazyComponent<typeof import("../components/Forms/CreateDevice.vue")['default']>
export const LazyGenerateQRCode: LazyComponent<typeof import("../components/GenerateQRCode.vue")['default']>
export const LazyKeyList: LazyComponent<typeof import("../components/KeyList.vue")['default']>
export const LazyProvenanceCreateRecord: LazyComponent<typeof import("../components/Provenance/CreateRecord.vue")['default']>
export const LazyProvenanceFeed: LazyComponent<typeof import("../components/Provenance/Feed.vue")['default']>
export const LazyProvenanceNotificationSignUpModal: LazyComponent<typeof import("../components/Provenance/NotificationSignUpModal.vue")['default']>
export const LazyProvenancePriorityNotices: LazyComponent<typeof import("../components/Provenance/PriorityNotices.vue")['default']>
export const LazyProvenanceCSV: LazyComponent<typeof import("../components/Provenance/ProvenanceCSV.vue")['default']>
export const LazyProvenanceShareDropdown: LazyComponent<typeof import("../components/Provenance/ShareDropdown.vue")['default']>
export const LazyProvenanceTagInput: LazyComponent<typeof import("../components/Provenance/TagInput.vue")['default']>
export const LazyQRCode: LazyComponent<typeof import("../components/QRCode.vue")['default']>
export const LazyTimestampList: LazyComponent<typeof import("../components/TimestampList.vue")['default']>
export const LazyTrackAsset: LazyComponent<typeof import("../components/TrackAsset.vue")['default']>
export const LazyCsvFile: LazyComponent<typeof import("../components/csvFile.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyScalarApiReference: LazyComponent<typeof import("../node_modules/@scalar/nuxt/dist/runtime/components/ScalarApiReference.vue")['default']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtSnackbar: LazyComponent<typeof import("../node_modules/nuxt-snackbar/dist/runtime/components/NuxtSnackbar.vue")['default']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<IslandComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>>

export const componentNames: string[]
