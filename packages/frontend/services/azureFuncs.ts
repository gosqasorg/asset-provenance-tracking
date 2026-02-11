// azureFuncs.ts -- Azure Functions
// Copyright (C) 2024 GOSQAS Team
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { validateKey } from '~/utils/keyFuncs';

// method takes the base58 encoded device key
export async function getProvenance(deviceKey: string) {
  try {
    if (!validateKey(deviceKey)) {
      throw new Error('Bad key provided');
    }

    const baseUrl = useRuntimeConfig().public.baseUrl;
    const fullUrl = baseUrl + '/provenance/' + deviceKey;

    try {
      let response = await fetchUrl(fullUrl);
      return (await response.json()) as {
        record: any;
        attachments?: string[];
        timestamp: number;
      }[];
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.log(`Key not found: ${deviceKey}.`);
    console.log(error);
    throw error;
  }
}

export async function getAttachment(baseUrl: string, deviceKey: string, attachmentID: string) {
  try {
    if (!validateKey(deviceKey)) {
      throw new Error('Bad key provided.');
    }

    const response = await fetch(`${baseUrl}/attachment/${deviceKey}/${attachmentID}`, {
      method: 'GET'
    });

    const blob = await response.blob();

    // Check for the attachment name
    let fileName = response.headers.get('Attachment-Name');
    // If the header is not present, fetch the attachment name
    if (!fileName) {
      // Fetch the attachment name
      const nameResponse = await fetch(`${baseUrl}/attachment/${deviceKey}/${attachmentID}/name`, {
        method: 'GET'
      });
      fileName = await nameResponse.text();
    }
    return { blob, fileName };
  } catch (error) {
    console.error('Error occurred during getAttachment request:', error);
    throw error; // re-throw the error if you want to handle it further up the call stack
  }
}

export async function postProvenance(deviceKey: string, record: any, attachments: readonly File[]) {
  if (!validateKey(deviceKey)) {
    throw new Error('Bad key provided.');
  }

  console.log('FILES: ' + JSON.stringify(attachments));

  const baseUrl = useRuntimeConfig().public.baseUrl;
  const formData = new FormData();
  console.log('string record ' + typeof JSON.stringify(record) + JSON.stringify(record));
  console.log('original record: ' + typeof record + ' ' + record);
  formData.append('provenanceRecord', JSON.stringify(record));
  for (const blob of attachments) {
    console.log('ATTASCH ' + blob.name + ' ' + blob); // JSON.stringify returns {}
    formData.append(blob.name, blob);
  }

  const fullUrl = baseUrl + '/provenance/' + deviceKey;

  // TODO: remove!
  for (const [key, value] of formData.entries()) {
    console.log(`Stored in FormData: ${key}: ${value}`);
  }
  console.log('FORMDATA INFO WE HAVE: ' + formData.entries() + '\n' + formData.values()); // typeof formData == object
  cacheRequest(fullUrl, formData);
  // throw fullUrl

  try {
    let response = await fetchUrl(fullUrl, formData);
    return (await response.json()) as { record: string; attachments?: string[] };
  } catch (error) {
    throw error;
  }
}

export async function postEmail(email: string) {
  const baseUrl = useRuntimeConfig().public.baseUrl;
  const formData = new FormData();
  formData.append('email', email);

  // backend urls are converted to all lowercase on deployment
  const response = await fetch(`${baseUrl}/feedbackvolunteer`, {
    method: 'POST',
    body: formData
  });
  if (response.status != 200) {
    throw new Error('postEmail: Failed to save email address');
  }
}

export async function getStatistics() {
  const baseUrl = useRuntimeConfig().public.baseUrl;
  const response = await fetch(`${baseUrl}/statistics`, {
    method: 'GET'
  });
  return (await response.json()) as { record: string; timestamp: number }[];
}

export async function fetchUrl(url: string, formData?: FormData) {
  let response = undefined;

  for (let i = 1; i <= 3; i++) {
    try {
      if (typeof formData !== 'undefined') {
        response = await fetch(`${url}`, {
          method: 'POST',
          body: formData
        });
      } else {
        response = await fetch(`${url}`, {
          method: 'GET'
        });
      }

      if (response !== undefined && response.status == 200) {
        return response;
      }
    } catch (e) {
      console.log('Fetch attempt failed: ' + e);
    }
  }

  if (response !== undefined && response.status !== 200) {
    console.log(`Failed to post provenance: ${response.status} ${response.statusText}`);
    throw new Error(response.status + ' ' + response.statusText);
  } else {
    throw new Error(
      `Could not connect to the server, check your internet connection and try again`
    );
  }
}

export async function cacheRequest(formUrl: string, formData: FormData) {
  // Convert formData to string and store it

  // TODO: using.get(provenanceRecord) IGNORES THE ATTACHMENTS!! We want to take all of formData and convert it to a string to cache
  // [(provRecord: ...), (filename: ...), ...]
  // Get all formData keys and set for each..? (.get(prov) and .get(file)?)
  // Look up how to convert formData into a string value
  localStorage.setItem(
    'gosqas_offline_cache',
    JSON.stringify([formUrl, formData.get('provenanceRecord')])
  );

  // TODO: return true/false to indicate record was or was not cached? need error handling of some sort??

  // NOTE: missing key 'provenanceRecord', make sure that doesn't break anything when creating!!
}
