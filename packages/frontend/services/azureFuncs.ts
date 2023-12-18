const baseUrl = 'https://gosqasbe.azurewebsites.net/api';


// method takes the base58 encoded device key
export async function getProvenance(deviceKey: string) {
    const response = await fetch(`${baseUrl}/provenance/${deviceKey}`, {
        method: "GET",
    });
    return await response.json() as { record: any, attachments?: string[], timestamp: number }[];
}

export async function getAttachment(deviceKey: string, attachmentID: string) {
    const response = await fetch(`${baseUrl}/attachment/${deviceKey}/${attachmentID}`, {
        method: "GET",
    });
    return await response.blob();
}

export async function postProvenance(deviceKey: string, record: any, attachments: readonly Blob[]) {
    const formData = new FormData();
    formData.append("provenanceRecord", JSON.stringify(record));
    for (const blob of attachments) {
        formData.append("attachment", blob);
    }
    const response = await fetch(`${baseUrl}/provenance/${deviceKey}`, {
        method: "POST",
        body: formData,
    });
    return await response.json() as { record: string, attachments?: string[] };
}