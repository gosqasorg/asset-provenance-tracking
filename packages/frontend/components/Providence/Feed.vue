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
            <div v-for="attachment in report.record.attachments">
                <a v-if="attachment.type.includes('image/')" :href="`/provenance/${this.deviceKey}/attachment/${attachment.attachmentID}`">
                    <img style="max-width:100px;width:100%" :src="`/provenance/${this.deviceKey}/attachment/${attachment.attachmentID}`"> // TODO: call attachments properly
                </a>
                <a v-else :href="`/provenance/${this.deviceKey}/attachment/${attachment.attachmentID}`">{{ attachment.attachmentID }}</a>
            </div>
            <div style="font-size: small;">{{ report.createdAt }}</div>
        </div>
    </div>
</template>


<script>
import { getProvenance, getAttachment } from '~/services/azureFuncs';

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
        };
    },
    mounted() {
        getProvenance(this.deviceKey)
        .then((response) => {
            this.reports = response;
            console.log("GET:");
            console.log(this.reports);
        })
        .catch((error) => {
            console.log(error);
        });
    }
};
</script>
