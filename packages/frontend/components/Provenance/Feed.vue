<!--
    This component is used to display the feed of reports for a device.
    It is used in the providence-fourm.vue page.
-->
<template>
    <div>
        <div v-for="(report, index) in provenance" class="report-box">
            <template v-if="report.record.blobType === 'deviceInitializer'">
                <h3 id = "createdDevicePoint">Created Device: {{ report.record.deviceName }}</h3>
                <div>{{ report.record.deviceDescription }}</div>
            </template>

            <template v-else>
            <div class="mb-1 tag-container">
    <span class="tag" v-for="tag in report.record.tags" v-bind:style="'color: '+textColorForTag(tag)+'; background-color: '+getColorForTag(tag)+';'">
    {{tag}}</span>
            </div>
            </template>

            <div>{{ report.record.description }}</div>
            <div v-for="(attachment, i) in attachmentURLs[index.toString()]" :key="i">
                <!-- Image -->
                <img :src="attachment.url" :alt="Image" style="width: 150px; padding: 5px;" data-bs-toggle="modal" data-bs-target="#imageModal" @click="modalImage = attachment.url">
                <a :href="attachment.url" :download="attachment.fileName" style="display: block; padding: 5px; text-align: left;">
                    Download Image
                </a>
            </div>
            <div style="font-size: small;">{{ new Date(report.timestamp) }}</div>
        </div>
    </div>
        <!-- The Modal to Enlarge Image -->
        <div class="modal fade" id="imageModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                 <div class="modal-content">
                        <img v-bind:src="modalImage" alt="Image" class="img-fluid">
                </div>
            </div>
        </div>
</template>

<script>
import { getProvenance, getAttachment } from '~/services/azureFuncs';
import { EventBus } from '~/utils/event-bus';
import { textColorForTag, getColorForTag } from '~/utils/colorTag';


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
            attachmentURLs: {},
            modalImage: "",
        };
    },
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

                    // Create object URLs for attachments and include filenames
                    const urls = attachments.map(attachment => ({
                    url: URL.createObjectURL(attachment.blob),
                    fileName: attachment.fileName
                    }));                

                    this.attachmentURLs[index.toString()] = urls;
                    console.log(`Attachment URLs for report ${index}:`, this.attachmentURLs[index.toString()]); // Debugging line


                }
            } catch (error) {
                console.error('Error occurred during getAttachment request:', error);
            }
        },
        refreshPage() {
            // set attachmentURLs to empty object to clear out old attachment URLs
            this.attachmentURLs = {};
            console.log("PROVENANCE",this.provenance);
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