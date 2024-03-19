<!--
    This component is used to display the feed of reports for a device.
    It is used in the providence-fourm.vue page.
-->
<template>
    <div>
        <div v-for="(report, index) in reports" class="p-4">
            <UCard>
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
                    <img :src="url" alt="Image" @click="isOpen = true" style="width: 150px;"/>
                    <UModal v-model="isOpen" :overlay="false">
                        <div class="p-4">
                            <img :src="url" alt="Image" @click="isOpen = true"/>
                        </div>
                    </UModal>
                </div>
                <div style="font-size: small;">{{ new Date(report.timestamp) }}</div>
            </UCard>
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
    },
    data() {
        return {
            reports: [],
            attachmentURLs: {},
            isOpen: false,
        };
    },
    created() {
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
                    const attachmentPromises = report.attachments.map(attachmentID => getAttachment(this.deviceKey, attachmentID));
                    const attachments = await Promise.all(attachmentPromises);
                    const urls = attachments.map(attachment => URL.createObjectURL(attachment));
                    this.attachmentURLs[index.toString()] = urls;
                }
            } catch (error) {
            console.error('Error occurred during getAttachment request:', error);
            }
        },
        refreshPage() {
            console.log('Feed refresh event received');
            // set attachmentURLs to empty object to clear out old attachment URLs
            this.attachmentURLs = {};
            getProvenance(this.deviceKey)
            .then((response) => {
                this.reports = response;
                this.reports.forEach((report, index) => {
                                        this.fetchAttachmentsForReport(report, index);
                                    });
                // Uncomment for debugging
                // console.log("GET:");
                // console.log(this.reports);
                //console.log(this.attachmentURLs);
            })
            .catch((error) => {
                console.log(error);
            });
        
        }, 
        openModal() {
            this.$bvModal.show('myModal')
        }
    },
};
</script>

<style scoped>
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
