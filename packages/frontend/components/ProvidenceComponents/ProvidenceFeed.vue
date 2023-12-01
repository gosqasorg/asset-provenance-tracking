
<!--
    This component is used to display the feed of reports for a device.
    It is used in the providence-fourm.vue page.
-->
<template>
    <div>
        <div v-for="report in reports">
            <div>{{ report.description }}</div>
            <div class="mb-1">
                <span v-for="tag in report.tags">{{ tag }}</span>
            </div>
            <div v-for="attachment in report.attachments">
                <a v-if="attachment.type.includes('image/')" :href="`/provenance/${deviceKey}/attachment/${attachment.attachmentID}`">
                    <img style="max-width:100px;width:100%" :src="`/provenance/${deviceKey}/attachment/${attachment.attachmentID}`">
                </a>
                <a v-else :href="`/provenance/${deviceKey}/attachment/${attachment.attachmentID}`">{{ attachment.attachmentID }}</a>
            </div>
            <div style="font-size: small;">{{ report.createdAt }}</div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        reports: {
            type: Array,
            default: () => []
        }, 
        deviceKey: {
            type: String,
            default: ""
        } // TODO: will this be given sepratly or in the reports?
    }
};
</script>