<!--
    This component is used to display the feed of reports for a device.
    It is used in the providence-fourm.vue page.
-->
<template>
    <div>
        <div v-for="(report, index) in reports" class="report-box">
            <template v-if="report.record.blobType === 'deviceInitializer'">
                <h3>Created Device: {{ report.record.deviceName }}</h3>
                <div>{{ report.record.deviceDescription }}</div>
            </template>

            <template v-else>
            <div class="mb-1 tag-container">
                <span class="tag" v-for="tag in report.record.tags">{{ tag }}</span>
            </div>
            </template>

            <div>{{ report.record.description }}</div>
            <div v-for="(url, i) in attachmentURLs[index.toString()]" :key="i">
                <img v-bind:src="url" alt="Image" style="width: 150px;">
            </div>
            <div style="font-size: small;">{{ Date(report.timestamp) }}</div>
        </div>
    </div>
</template>


<script>
import { getProvenance, getAttachment } from '~/services/azureFuncs';
import { EventBus } from '~/utils/event-bus';

export default {
    props: {
        deviceKey: {
            type: String,
            default: "",
        },
        provenance: {
            default: null,
        },
    },
    data() {
        return {
            reports: [],
            attachmentURLs: {},
        };
    },

    // This was changed from "created". We didn't have Nuxt Composabl to get useRuntimeConfig
    // if we uesd created.
    mounted() {
        EventBus.on('feedRefresh', this.refreshPage);
        this.refreshPage();
    },
    beforeDestroy() {
        EventBus.off('feedRefresh', this.refreshPage);
    },
    methods: {
        async fetchAttachmentsForReport(report, index) {
            try {
                if (report.attachments.length > 0) {
                    const baseUrl = useRuntimeConfig().public.baseUrl;
                    const attachmentPromises = report.attachments.map(attachmentID => getAttachment(baseUrl,this.deviceKey, attachmentID));
                    const attachments = await Promise.all(attachmentPromises);
                    const urls = attachments.map(attachment => URL.createObjectURL(attachment));
                    this.attachmentURLs[index.toString()] = urls;
                }
            } catch (error) {
                console.error('Error occurred during getAttachment request:', error);
            }
        },
        // TODO: This is a problem because it is being called before
        // we have a composable or a context established. we can't call useRuntimeConfig()
        // above.
        refreshPage() {
            // set attachmentURLs to empty object to clear out old attachment URLs
            this.attachmentURLs = {};
            console.log("PROVENANCE",this.provenance);
            this.reports = this.provenance;
//            this.provenance.forEach((report, index) => this.fetchAttachmentsForReport(report, index));
            this.provenance.forEach((report, index) => this.fetchAttachmentsForReport(report, index));

        }
    },
};
</script>

<style scoped>
.report-box {
  border: 1px solid #ccc;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.tag-container {
  display: flex;
  flex-wrap: wrap;
}

.tag {
  background-color: #f2f2f2;
  color: #333;
  padding: 5px 10px;
  margin: 5px;
  border-radius: 5px;
  font-size: 14px;
}
</style>
