<template>
    <button type="button" class="btn mt-1 bg-sky px-5" v-on:click="downloadCSV">
        Download Provenance Record as CSV
    </button>

</template>

<script>

import { getProvenance, getAttachment} from '~/services/azureFuncs';

export default {
    props: {
        deviceKey: {
        type: String,
        required: true,
        },
    },

    methods: {

        async downloadCSV() {

            //Code copied from Feed.vue
            async function getAttachmentName(provenance, key) {
                const baseUrl = useRuntimeConfig().public.baseUrl;
                const attachmentPromises = provenance.attachments.map(attachmentID => getAttachment(baseUrl,key, attachmentID));
                const attachments = await Promise.all(attachmentPromises);
                const fileName = attachments.map(att => att.fileName);

                return fileName;
            }

            let provenance = await getProvenance(this.deviceKey);

            //get all the file names as these need to access backend
            let fileNames = await Promise.all(provenance.map( x => getAttachmentName(x, this.deviceKey)));

            let data = provenance.map( (x, index) =>
                ([new Date(x.timestamp)]).concat(String('"' + x.record.description + '"'),
                                        String('"'+ x.record.tags + '"'),
                                        String('"'+fileNames[index]+'"'),
                                        String('"'+x.record.children_name+'"'),
                                        String('"'+x.record.children_key+'"') )).join("\n");


            data = data.replaceAll('[]','') //removes any empty arrays [] 

            let headers = ["Time", "Description", "Tags", "Attachment File Name", "Children Names", "Children Keys"];
            let new_data = headers + "\n" + data;

            const anchor = document.createElement('a');
            anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(new_data);
            anchor.target = '_blank';
            anchor.download = (provenance[provenance.length - 1].record).deviceName + '-provenance.csv';
            anchor.click();
        }
    }
}


</script>