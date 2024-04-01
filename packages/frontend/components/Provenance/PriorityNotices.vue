<!--
    This component is used to display the feed of reports for a device.
    It is used in the providence-fourm.vue page.
-->
<template>
  PriorityNotices:
  <div>
    <div  v-for="(report, index) in notices" class="report-box">
      <div class="mb-1 tag-container">
        <span class="tag" v-for="tag in report.record.tags">{{ tag }}</span>
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
            notices: [],
            attachmentURLs: {},
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
                    const urls = attachments.map(attachment => URL.createObjectURL(attachment));
                    this.attachmentURLs[index.toString()] = urls;
                }
            } catch (error) {
                console.error('Error occurred during getAttachment request:', error);
            }
        },
        refreshPage() {
            console.log("XXXXXXXX");
            // set attachmentURLs to empty object to clear out old attachment URLs
            this.attachmentURLs = {};
            // First, we search for the high-priority notices;
            // at the time of this writing, recall is the only one.
            console.log(this.provenance);
            this.notices = this.provenance.filter(
                (p) => p.record.tags && p.record.tags.includes("recall"));
            console.log("NOTICES",this.notices);

            this.notices.forEach((report, index) => this.fetchAttachmentsForReport(report, index));

        }
    },
};
</script>

    <style scoped>
    .div {
  background-color: red;
    }
.report-box {
    border: 5px solid #f00);
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
