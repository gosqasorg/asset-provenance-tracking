<template>
    <button type="button" class="btn mt-1 px-5 mb-5" v-on:click="downloadProvenanceCSV">
        Download Provenance as CSV
    </button>
</template>

<script>
import { getProvenance, getAttachment } from '~/services/azureFuncs';


export default {
    props: {
        recordKey: {
            type: String,
            required: true,
        },
    },

    methods: {
        async downloadProvenanceCSV() {
            try {
                // Fetch provenance provenanceItem using the provided recordKey
                const provenanceData = await getProvenance(this.recordKey);

                if (!provenanceData || provenanceData.length === 0) {
                    // Handle case where no provenance record are found
                    console.error('No provenance record found');
                    return;
                }

                // Create CSV header
                let csvContent = 'Timestamp,Description,Device Name,Tags,Reporting Key,Children Names,Children Keys,Attachment File\n';
                let hasReportingKey = false;

                for (const provenanceItem of provenanceData) {
                    // Format timestamp in UTC with both local and UTC time
                    const date = new Date(provenanceItem.record.timestamp || provenanceItem.timestamp);
                    const localTime = date.toLocaleString().replace(',', '');
                    const utcTime = date.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');
                    const timestamp = `${localTime} (${utcTime})`;

                    //Format Description and Device Name
                    const description = provenanceItem.record?.description?.replace(/"/g, '""') || '';
                    const deviceName = provenanceItem.record?.deviceName?.replace(/"/g, '""') || '';

                    // Format tags
                    const tags = (provenanceItem.record?.tags || [])
                        .map(tag => `"${tag.replace(/"/g, "''")}"`)
                        .join(';');
                    const formattedTags = `[${tags}]`;


                    //Find Children Names and format them
                    let children = (provenanceItem.record?.children_name || [])
                        .map(tag => `"${tag.replace(/"/g, "''")}"`);

                    // Find Children Keys and format them
                    let childrenKeys = (provenanceItem.record?.children_key || [])
                        .map(tag => `"${tag.replace(/"/g, "''")}"`);
                    
                    let reportingKey = '';

                    if (children[0] == '""') {
                        children.shift()
                        reportingKey = childrenKeys[0];
                        childrenKeys.shift()
                        hasReportingKey = true;
                    }

                    const childrenNames = `[${children.join(';')}]`

                    const formattedChildrenKeys = `[${childrenKeys.join(';')}]`;

                    const formattedReportingKey = reportingKey;


                    // Get attachment filename
                    const baseUrl = useRuntimeConfig().public.baseUrl;
                    const attachmentPromises = (provenanceItem.attachments || []).map(async (attachmentId) => {
                        try {
                            const { fileName } = await getAttachment(baseUrl, this.recordKey, attachmentId);
                            return fileName || attachmentId;
                        } catch (error) {
                            console.error(`Error fetching attachment name for ${attachmentId}:`, error);
                            return attachmentId;
                        }
                    });

                    const attachmentName = await Promise.all(attachmentPromises);
                    const stringifyAttachmentName = attachmentName
                        .map(name => `"${name.replace(/"/g, '""')}"`);

                    // Concatenate relevant data for csv file
                csvContent += `${timestamp},${description},${deviceName},${formattedTags},${formattedReportingKey},${childrenNames},${formattedChildrenKeys},${stringifyAttachmentName}\n`;
                }

                // Create and trigger download
                const anchor = document.createElement('a');
                anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
                anchor.target = '_blank';
                anchor.download = `provenance_${this.recordKey}.csv`;
                anchor.click();
            } catch (error) {
                console.error('Error generating CSV:', error);
            }
        }
    }
}
</script>
<style>
/* Dark mode version*/
@media (prefers-color-scheme: dark) {
    .btn {
        background-color: #1E2019;
        border: 2px solid #FFFFFF !important;
        color: white;
    }

    .btn:hover {
        border: 0px !important;
        color: white;
    }
}

/* Light mode version*/
@media (prefers-color-scheme: light) {
    .btn {
        background-color: #CCECFD;
        border: #CCECFD;
        color: black;
    }

    .btn:hover {
        color: black;
    }
}
</style>