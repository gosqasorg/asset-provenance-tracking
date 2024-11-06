import type { ProvenanceRecord } from "#imports";
import { getAttachment, postProvenance } from "~/services/azureFuncs";


export function getNotifications(provenance: any) {
    const notifications = provenance.filter(
        p => p.record.tags && p.record.tags.includes("recall")
    );

    // TODO: lazy load attachments
    // notifications.forEach((report, index) => getAttachments(report, index));
    return notifications;
}

export async function getAttachments(deviceKey: string, record: ProvenanceRecord) {
    // let attachmentURLs: Record<string, string[]> = {};
    try {
        
        if (record.attachments && record.attachments.length > 0) {
            const baseUrl = useRuntimeConfig().public.baseUrl;
            const attachmentPromises = record.attachments.map((id: string) => getAttachment(baseUrl, deviceKey, id));
            const attachments = await Promise.all(attachmentPromises);
            console.log(attachments);
            // const urls = attachments.map(attachment => URL.createObjectURL(attachment));
            // attachmentURLs[index.toString()] = urls;
        }
    } catch (error) {
        console.error('Error occurred during getAttachment request:', error);
    }
}

export async function messageChildren(childrenkeys: string[], recallReason: string, tags: string[]) {
    for (const key of childrenkeys) {
        if (key != "" && key != "undefined") {
            await postProvenance(key,
            {
                blobType: 'deviceRecord',
                description: recallReason,
                children_key: '',
                tags: tags,
            },
            []);
            // this.attachments || [])
        }
    }
}


export async function notifyAll(tags: string[], descendantsList: string[]) {
    // const recall = this.tags.indexOf("recall", 0);        

    // "recall" is being added....
    // if (recall > -1 || (<HTMLInputElement>document.getElementById("notify-all")).checked) {
    //     let reason = ""
    //     if (recall > -1) { 
    //         reason = "Recalled by Admin Key";
    //     } else { 
    //         reason = this.description; 
    //         this.tags = (this.tags).concat(['notify_all']);
    //     }

    //     if (this.isReportingKey) {
    //         // reporting keys do not have the ability to recall
    //         console.log("Action failed. This is a reporting key.");
    //     } else {
    //         await this.messageChildren(descendantsList, reason, this.tags)
    //         console.log("Finished recalling/informing");
    //     }
    // }
}