<!--
    This component is used to display the feed of reports for a device.
    It is used in the providence-fourm.vue page.
-->
<template>
    <div>
        <div v-for="report in reports">
            <div>{{ report.record.description }}</div>
            <div class="mb-1">
                <span v-for="tag in report.tags">{{ tag }}</span>
            </div>
            <div v-for="attachmentCode in report.record.attachments">
                <img :src="attachmentsData[attachmentCode].url" :alt="attachmentsData[attachmentCode].name">
            </div>
            <div style="font-size: small;">{{ report.createdAt }}</div>
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
            attachments: [],
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
        fetchAttachmentData(report) {
            report.attachments.forEach((attachmentCode) => {
            getAttachment(attachmentCode)
                .then((data) => {
                this.$set(this.attachmentsData, attachmentCode, data);
                })
                .catch((error) => {
                console.error('Error occurred during getAttachment request:', error);
                });
            });
        },
        refreshPage() {
            console.log('Feed refresh event received');
            getProvenance(this.deviceKey)
            .then((response) => {
                this.reports = response;

                // Uncomment for debugging
                //console.log("GET:");
                //console.log(this.reports);
            })
            .catch((error) => {
                console.log(error);
            });
            
            if (this.reports.length > 0) {
                this.report.forEach(this.fetchAttachmentData);
            }
        }
    },
};
</script>
