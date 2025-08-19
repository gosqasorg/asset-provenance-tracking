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
      required: true
    }
  },

  methods: {
    async downloadCSV() {
      try {
        const provenance = await getProvenance(this.recordKey);
        const childrenKeys = await getChildrenKeys(this.recordKey);

        const reportingRecord = provenance?.[0]?.record;
        const reportingKey =
          reportingRecord?.children_key?.[0] || reportingRecord?.reportingKey || '';

        const parentUrl = (window.location.origin + this.$route.fullPath).replace(/,+$/, '');
        const parentName = reportingRecord.deviceName?.replace(/"/g, '""') || '';

        // Skip the parent
        const filteredChildrenKeys = childrenKeys.filter((key) => key !== this.recordKey);

        let isReportingKey = ''; //Flag to check if row is the record key row or not

        const csvRows = [
          [
            'Parent Record Key',
            'Parent URL',
            'Parent Device Name',
            'Reporting Key',
            'Child Name',
            'Child Key',
            'Child Key URL',
            'isReportingKey'
          ]
        ];

        for (let i = 0; i < provenance?.[0]?.record.children_key.length; i++) {
          const provenanceList = await getProvenance(childKey);
          const record = provenanceList?.[0]?.record || {};

          const childName = record.deviceName || '';
          const childUrl = `${window.location.origin}/history/${childKey}`;

          if (childKey == reportingKey) {
            isReportingKey = 'T';
          } else {
            isReportingKey = 'F';
          }

          csvRows.push([
            `"${this.recordKey}"`,
            `"${parentUrl}"`,
            `"${parentName}"`,
            `"${reportingKey}"`,
            `"${childName.replace(/"/g, '""')}"`,
            `"${childKey}"`,
            `"${childUrl}"`,
            `"${isReportingKey}"`
          ]);
        }

        const csvContent = csvRows.map((r) => r.join(',')).join('\n');

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
};
</script>
