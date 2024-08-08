<template>
    <button type="button" class="btn mt-1 bg-sky px-5" v-on:click="downloadCSV">
        Download Provenance as CSV
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

            async function getAttachmentName(provenance, key) {
                const baseUrl = useRuntimeConfig().public.baseUrl;
                // console.log("retrieve provenance, ", provenance);
                const attachmentPromises = provenance.attachments.map(attachmentID => getAttachment(baseUrl,key, attachmentID));
                const attachments = await Promise.all(attachmentPromises);
                // console.log("atts ", attachments);
                const fileName = attachments.map(att => att.fileName);
                // console.log("this name", fileName);

                // const oneLiner = (await Promise.all((provenance[0]).attachments.map(attachmentID => getAttachment(baseUrl,this.deviceKey, attachmentID)))).map(att => att.fi);
                // console.log("the one liner", oneLiner);

                return fileName;
            }

            let provenance = await getProvenance(this.deviceKey);

            // console.log("calling it" , await getAttachmentName(provenance, this.deviceKey));

            let data = provenance.map( x =>
                ([Date(x.timestamp)]).concat(x.record.description,
                                        // x.attachments.fileName,
                                        // await getAttachmentName(x, this.deviceKey),
                                        JSON.stringify(x.record.tags),
                                        JSON.stringify(x.record.children_name),
                                        JSON.stringify(x.record.children_key) )).join("\n");

            // let data1 = data.map(each => each.join("\n"));
            console.log("this is data ", data);

            let headers = ["Time", "Description", "Tags", "Children Names", "Children Keys"];
            let new_data = headers + "\n" + data;

            console.log("new data", new_data)

            const anchor = document.createElement('a');
            anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(new_data);
            anchor.target = '_blank';
            anchor.download = (provenance[provenance.length - 1].record).deviceName + '-provenance.csv';
            anchor.click();
        }
    }
}


</script>