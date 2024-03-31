const baseUrl = 'https://gosqasbe.azurewebsites.net/api';

// method takes the base58 encoded device key
export async function getProvenance(deviceKey: string) {
    try {
    const response = await fetch(`${baseUrl}/provenance/${deviceKey}`, {
        method: "GET",
    });
        return await response.json() as { record: any, attachments?: string[], timestamp: number }[];
    } catch (error) {
        // probably we didn't find the key...
        console.log(`It is likely that they key your requestd: ${deviceKey} does not exist.`);
        console.log(error);
        throw error;
    }
}

export async function getAttachment(deviceKey: string, attachmentID: string) {
    try {
        const response = await fetch(`${baseUrl}/attachment/${deviceKey}/${attachmentID}`, {
          method: "GET",
        });
        return await response.blob();
      } catch (error) {
        console.error('Error occurred during getAttachment request:', error);
        throw error; // re-throw the error if you want to handle it further up the call stack
      }
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
