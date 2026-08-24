import sharp from 'sharp'

// --- Setup --- //

// Setup credentials
let KEY1 = process.env.KEY1
let KEY2 = process.env.KEY2
let LOCATION = process.env.LOCATION
let ENDPOINT = process.env.ENDPOINT

// Check credentials
if(! [KEY1, 
      KEY2,
      LOCATION, 
      ENDPOINT
     ].every(Boolean)
) { console.error('Error: credentials not set'); process.exit(1) }


// --- Code --- //

export async function isImage(someBlob, context) {
  context.log('Entering isImage')

  let theBuffer = await convertFileForSharp(someBlob)
  let magic_bytes = theBuffer.slice(0, 25).toString('hex')

  if(magic_bytes.slice(0, 6) == 'ffd8ff') {
    return true  // jpg
  } else if(magic_bytes.slice(0, 8) == '89504e47') {
    return true  // png
  } else if(magic_bytes.slice(0, 8) == '47494638') {
    return true  // gif
  } else if(magic_bytes.slice(0, 8) == '52494646') {
    return true  // webp
  } else if(magic_bytes.slice(0, 8) == '49492a00') {
    return true  // tiff, little-endian
  } else if(magic_bytes.slice(0, 8) == '4d4d002a') {
    return true  // tiff, big-endian
  } else if(magic_bytes.slice(0, 2) == '424d') {
    return true  // bmp
  } else if(magic_bytes.slice(0, 25) == '0000001C6674797061766966') {
    return true  // avif
  } else if(magic_bytes.slice(0, 25) == '0000001C6674797068656963') {
    return true  // heic (iPhone)
  }

  context.log('Leaving isImage. Attachment is not an image')
  return false;
}

export async function convertFileForSharp(inputFileObject: File) {
  if (! (inputFileObject instanceof File) ){ throw new Error('Not got: File') }

  console.log(inputFileObject.constructor.name, Object.keys(inputFileObject))
  console.log(inputFileObject.constructor.name, Object.keys(inputFileObject), inputFileObject.size)
  let theBuffer = await Buffer.from(await inputFileObject.arrayBuffer())
  if(! (theBuffer instanceof Buffer) ){ throw new Error('not made: buffer') }
  return theBuffer
}

export async function downscaleIfApplicableAndBase64Encode(inputFileBuffer: Buffer) {
    if(! (inputFileBuffer instanceof Buffer) ){ throw new Error('not got: buffer') }
    try {
        let base64EncodedString = await (await sharp(inputFileBuffer)
            .resize(2048, 2048, {
                fit: 'inside',
                withoutEnlargement: true // only resize if necessary
            }).toBuffer()).toString('base64')
        if(! (typeof base64EncodedString == 'string') ){ throw new Error('not made: String') }
        return base64EncodedString;
    } catch(error) {
        console.error('Error reading file')
        console.error(error)
        process.exit(1)
    }
}

// returns true if image is ok, return false if image is flagged
export async function checkImageAgainstContentModerationAPI(base64File: string/*, KEY1, ENDPOINT*/) {
    if(! (typeof base64File == 'string') ){ throw new Error('not got: string') }

    // Build json
    let payload = {
        "image": {
            "content": base64File
        },
        "categories": [
            "Hate",
            "SelfHarm",
            "Sexual",
            "Violence"
        ],
        "outputType": "FourSeverityLevels"
    }

    let body = {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': KEY1,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }

    // Perform HTTP Interaction
    let url = ENDPOINT + 'contentsafety/image:analyze?api-version=2024-09-01'
    let response, result; if(! ((response = await fetch(url, body)).status == 200)) {
        throw new Error(`Error: API Interaction Failed: ${await response.text()}`)
    } result = JSON.parse(await response.text())

    // Calculate score: Pass: score = 0; Fail: score > 0. 
    let total_score = 0;
    for(let i = 0; i < result['categoriesAnalysis'].length; ++i) {
        total_score += result['categoriesAnalysis'][i]['severity']
    }

    return total_score > 0 ? 'Fail' : 'Pass'    
}

export async function imageIsNotPermitted(inputFileObject: File, context) {
  context.log('Entering imageIsNotPermitted')
  let buffer = await convertFileForSharp(inputFileObject)
  let base64EncodedString: string = await downscaleIfApplicableAndBase64Encode(buffer)
  let contentModerationResult = await checkImageAgainstContentModerationAPI(base64EncodedString)
  context.log(`Leaving imageIsNotPermitted. Result: ${
    contentModerationResult == 'Fail' ? 'Flagged.' : 'Not flagged.'
  }`)

  return contentModerationResult == 'Fail' ? true : false;
}