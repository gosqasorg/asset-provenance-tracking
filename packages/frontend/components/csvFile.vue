<template>
    <button type="button" class="btn mt-1 bg-sky px-5 mb-5" v-on:click="downloadCSV">
        Download Children Keys as CSV
    </button>

</template>

<script>

import { getChildrenKeys } from '~/utils/descendantList';
import { getProvenance } from '~/services/azureFuncs';

export default {
    props: {
        recordKey: {
            type: String,
            required: true,
        },
    },

    methods: {
        async downloadCSV() {
            try {
                const childrenKeys = await getChildrenKeys(this.recordKey);
                const reportingProvenance = await getProvenance(this.recordKey);

                const reportingRecord = reportingProvenance?.[0]?.record;
                const reportingKey = reportingRecord?.children_key?.[0] || reportingRecord?.reportingKey || '';

                // Skip the parent
                const filteredChildrenKeys = childrenKeys.filter(key =>
                    key !== this.recordKey && key !== reportingKey
                );

                const csvRows = [['Child Name', 'Parent Record Key', 'Reporting Key', 'Child Key URL']];

                for (const childKey of filteredChildrenKeys) {

                    const provenanceList = await getProvenance(childKey);
                    const record = provenanceList?.[0]?.record || {};

                    const childName = record.deviceName || '';
                    const childUrl = `${useRuntimeConfig().public.frontendUrl}/history/${childKey}`

                    csvRows.push([
                        `"${childName.replace(/"/g, '""')}"`,
                        `"${this.recordKey}"`,
                        `"${reportingKey}"`,
                        `"${childUrl}"`
                    ]);
                }

                const csvContent = csvRows.map(r => r.join(',')).join('\n');

                const anchor = document.createElement('a');
                anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
                anchor.target = '_blank';
                anchor.download = `children_${this.recordKey}.csv`;
                anchor.click();
            } catch (error) {
                console.error('Error generating children CSV:', error);
            }
        }
    }
}


</script>
