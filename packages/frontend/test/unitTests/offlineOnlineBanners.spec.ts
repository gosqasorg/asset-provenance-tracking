import { afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createRouter, createWebHistory, useRoute } from 'vue-router';
import { detectOffline } from '~/composables/detectOffline';
import OfflineEdits from '~/pages/offline-edits.vue';
import CreateDevice from '~/components/Forms/CreateDevice.vue';
import CreateContainer from '~/components/Forms/CreateContainer.vue';
import CreateRecord from '~/components/Provenance/CreateRecord.vue';
import DeviceKey from '~/pages/history/[deviceKey].vue';
import Offline from '~/pages/history/offline.vue';

// Mock getProvenance to get a mocked response
vi.mock('~/services/azureFuncs', () => ({
    getProvenance: vi.fn(() => Promise.resolve([{record:{"blobType":"deviceInitializer","deviceName":"sdfsa","description":"dfsadf","tags":[],"children_key":"","hasParent":false,"isPublicKey":false},"attachments":[],"deviceID":"fdb7f0f492cc2ab9cd43f5cb9738cdd34dd88f6e538060023847fb9d7168dd4b","timestamp":1795644353836}]))
}))

// Mock vue-router for useRoute() for params, code, and token
vi.mock('vue-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('vue-router')>()
    return {
        ...actual,
        useRoute: vi.fn(() => ({
            params: { deviceKey: 'MckwyCegERDvBwNNQXbE78' },
            query: { code : '12345' , token: '67890' }
        })),
    }
})

// Create mock $router paths/pages
let router: any
beforeEach(async () => {
    router = createRouter({
        history: createWebHistory(),
        routes: [
            { path: '/offline-edits', component: OfflineEdits },
            { path: '/history/MckwyCegERDvBwNNQXbE78', component: DeviceKey}
        ]
    })
    await router.push('/history/MckwyCegERDvBwNNQXbE78')
    await router.isReady();
})

afterEach(() => {
    vi.restoreAllMocks();
});

describe("Offline and Online Banners Tests", () => {

    // Seed the localStorage variable that toggles the 'X' button to quit the online banner on the offline-edits page
    localStorage.setItem('xToggle', '');
    // Seed localStorage queued stash
    localStorage.setItem('gdt-stash-queued', JSON.stringify('testKey'))

    // Mount CreateDevice component for VTU to render
    const mockPush = vi.fn();
    const CreateDeviceWrapper = mount(CreateDevice, {
             global: {
                plugins: [router],
                mocks: {
                    $router: { push: mockPush },
                }
            }
        })
    
    // Mount CreateContainer component
    const CreateContainerWrapper = mount(CreateContainer, {
            global: {
            plugins: [router],
            mocks: {
                $router: { push: mockPush },
            }
        }
    })

    // Mount CreateRecord component
    const CreateRecordWrapper = mount(CreateRecord, {
            global: {
            plugins: [router],
            mocks: {
                $router: { push: mockPush },
            }
        }
    })

    // Mount history/offline page
    const OfflineWrapper = mount(Offline, {
        global: {
            plugins: [router],
            mocks: {
                $router: { push: mockPush },
            }
        }
    })

    // Mount offline-edits page
    const OfflineEditsWrapper = mount(OfflineEdits, {
        global: {
            plugins: [router],
            mocks: {
                $router: { push: mockPush }
            }
        }
    })

    it("Display Offline Banners", async() => {

        // Simulate offline
        vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
        window.dispatchEvent(new Event('offline'))

        // // Detect offline
        // const isOffline = detectOffline();
        // await nextTick();

        // Test to see if offline
        expect(navigator.onLine).toBe(false)

        // Mount [deviceKey].vue page
        const DeviceKeyWrapper = mount(DeviceKey, {
            data() {
                return {
                    blobType: 'asdf',
                    recordKeyFound: true,
                    displayOfflineBannerBoolean: detectOffline(),
                }
            },
            global: {
                plugins: [ router ],
                stubs: ['router-link', 'router-view'],
            }
        });  
        await flushPromises();

        // CreateDevice: First offline banner
        expect(CreateDeviceWrapper.find('div.banner:nth-child(8) > div:nth-child(2)').exists()).toBe(true);
        // CreateDevice: Second offline banner
        expect(CreateDeviceWrapper.find('div.banner:nth-child(9) > div:nth-child(2)').exists()).toBe(true);

        // CreateContainer: First bottom offline banner
        expect(CreateContainerWrapper.find('div.banner:nth-child(12) > div:nth-child(2)').exists()).toBe(true);
        // CreateContainer: Second bottom offline banner
        expect(CreateContainerWrapper.find('div.banner:nth-child(13) > div:nth-child(2)').exists()).toBe(true)

        // CreateRecord: Offline banner
        expect(CreateRecordWrapper.find('div.banner:nth-child(3) > div:nth-child(2)').exists()).toBe(true);

        // [deviceKey].vue: First top offline banner
        expect(DeviceKeyWrapper.find('div.banner:nth-child(1) > div:nth-child(2)').exists()).toBe(true);
        // [deviceKey].vue: Second top offline banner
        expect(DeviceKeyWrapper.find('div.banner:nth-child(2) > div:nth-child(2)').exists()).toBe(true);
        // [deviceKey].vue: Bottom offline banner
        expect(DeviceKeyWrapper.find('div.banner:nth-child(3) > div:nth-child(2)').exists()).toBe(true);

        // Offline-edits: Offline banner
        //)


        // history/offline: Offline banner
        expect(OfflineWrapper.find('.banner > div:nth-child(2)').exists()).toBe(true)

    }),

    it("Display Online Banners", async() => {

        // Mount deviceKey.vue page
        const DeviceKeyWrapper = mount(DeviceKey, {
            data() {
                return {
                    blobType: 'asdf',
                    recordKeyFound: true,
                    displayOfflineBannerBoolean: detectOffline(),
                }
            },
            global: {
                plugins: [ router ],
                stubs: ['router-link', 'router-view'],
            }
        });
        await flushPromises();

        // Switch from offline to online
        vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
        window.dispatchEvent(new Event('online'))

        // Detect online
        const isOffline = detectOffline();
        await nextTick();

        // Test to see if online
        expect(navigator.onLine).toBe(true);

        CreateDeviceWrapper.vm.displayOfflineBannerBoolean = isOffline.value;
        await nextTick();

        // CreateDevice: Online banner
        expect(CreateDeviceWrapper.find('.banner > div:nth-child(2)').exists()).toBe(true);

        // CreateContainer: Online banner
        expect(CreateContainerWrapper.find('.banner > div:nth-child(2)').exists()).toBe(true);

        // CreateRecord: Online banner
        expect(CreateRecordWrapper.find('div.banner:nth-child(3) > div:nth-child(2)').exists()).toBe(true)

        // history/offline: Online banner
        expect(OfflineWrapper.find('.banner > div:nth-child(2)').exists()).toBe(true)

        console.log("OFFLINE EDITS OFFLINE?: ", OfflineEditsWrapper.vm.displayOfflineBannerBoolean)
        // Offline-edits: Online banner
        expect(OfflineEditsWrapper.find('.banner > div:nth-child(2)').exists()).toBe(true)


        // TODO: ASK ABOUT PAGE RENDERING WHEN THERE'S A VALID KEY
        // Look for top online banner on deviceKey.vue Page
        //expect(DeviceKeyWrapper.find('#logo-dark').exists()).toBe(true);


    //     const OfflineEditsWrapper = mount(OfflineEdits);
    //     const CreateContainerWrapper = mount(CreateContainer);
    //     const CreateRecordWrapper = mount(CreateRecord);
    //     const DeviceKeyWrapper = mount(DeviceKey);
    //     const OfflineWrapper = mount(Offline);
    }),

    it("Click on 'View my offline edits' Link and Navigate to Offline-Edits Page", async() => {


        const isOffline2 = detectOffline();
        // Check that 'View my offline edits' link on online banner exists
        expect(CreateDeviceWrapper.find('.banner-link').exists()).toBe(true);

        console.log("isOFFLINE?: ", isOffline2.value)
        console.log("ONLINE IN OFFLINE EDITS?: ", navigator.onLine)
        console.log("OFFLINE EDITS BEFORE OFFLINEBANNER CHANGE: ", OfflineEditsWrapper.vm.displayOfflineBannerBoolean)

        OfflineEditsWrapper.vm.displayOfflineBannerBoolean = isOffline2.value
        console.log("OFFLINE EDITS AFTER OFFLINEBANNER CHANGE: ", OfflineEditsWrapper.vm.displayOfflineBannerBoolean)


        // Click on 'View my offline edits' link on the online banner
        await CreateDeviceWrapper.find('.banner-link').trigger('click');

        await router.push('/offline-edits');
        await router.isReady();
        await nextTick();

        // Check that the link works after clicking it to navigate to /offline-edits path
        expect(router.currentRoute.value.path).toBe('/offline-edits')

        //console.dir(OfflineEditsWrapper.html())

        // Check that online banner on offline-edits page exists
        expect(OfflineEditsWrapper.find('.banner > div:nth-child(2)').exists()).toBe(true);

        // Check the closing 'X' on the online banner exists after clicking on link from online banner in Create Device Page
        expect(OfflineEditsWrapper.find('.closeOnlineBanner').exists()).toBe(true);
    })
})
