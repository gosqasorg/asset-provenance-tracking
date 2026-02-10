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

  const baseUrl = useRuntimeConfig().public.baseUrl;
  const formData = new FormData();
  console.log('string record ' + typeof JSON.stringify(record) + JSON.stringify(record));
  formData.append('provenanceRecord', JSON.stringify(record));
  for (const blob of attachments) {
    formData.append(blob.name, blob);
  }

  const fullUrl = baseUrl + '/provenance/' + deviceKey;

  // TODO: remove!
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

async function fetchUrl(url: string, formData?: FormData) {
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
  localStorage.setItem(
    'gosqas_offline_cache',
    JSON.stringify([formUrl, formData.get('provenanceRecord')])
  );

  // TEST DELETE/MOVE TO TEST FILE: can we retrieve the data from localstorage? does the type stay the same?
  let test = localStorage.getItem('gosqas_offline_cache');

  // Check return values (delete later)
  console.log('return type: ' + typeof JSON.parse(test)[1]); // TODO: what type?
  console.log('Information Stored: ' + JSON.parse(test)[0] + '\n*' + JSON.parse(test)[1]);

  // Need FormData object for posting!!
  const formData2 = new FormData();
  console.log('string record ' + JSON.parse(test)[1]); // TODO: We need only the SECOND part of the return AND TYPE STRING!!
  formData2.append('provenanceRecord', JSON.parse(test)[1]);

  // TODO: delete return, this is just to test if we can use return for creating record
  return [formUrl, formData2];

  // TODO: return true/false to indicate record was or was not cached? need error handling of some sort

  // TODO: make sure tests/code work for attachments as well!

  // NOTE: missing key 'provenanceRecord', make sure that doesn't break anything when creating!!
}
