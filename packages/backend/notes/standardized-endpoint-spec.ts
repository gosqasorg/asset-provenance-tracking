
// e.g., postProvenanceHandler
async function foobar(request, context) {
  context.log('Entered foobar')

  // do actual operation

  context.log('Foobar returning successfully')
  return result
}

// Endpoint handler: Ensures it was called correctly, ensures we're returning correctly, and responds to the user
// The job of an endpoint handler is to ensure it was called correctly, hand everything to a function that does some work and maybe hands something back, ensure what was handed back parses (that we are upholding our end of the deal in having a spec), and responds to the caller. 
async function foobarHandler(request, contex) {
  context.log('Entering foobarHandler')
  try {
    // Define zod schema
    schema.parse(request)  // The whole request, but our goal is to validate against the spec, which, in development, we may discover to be incorrect, which will require A) what it should be to be found out and B) updating the schema
    const someValue = await foobar(request, context)  // Always pass context

    // define zod schema corresponding to spec
    const parseResult = schema.safeParse(someValue)  // safeParse so this is not reported to the user as a 429 error
    if(!parseResult.success) {
      context.error(`Error in foobarHandler: value to be returned did not parse: ${JSON.stringify(result)}`)
      // Return it anyway, although, perhaps security hazard to do so
      return someValue
    }

    context.log('Returning successfully from foobarHandler')
    return someValue

  } catch(error) {
    return errorHandler('foobar', error)
  }
}

app.post("notifySubscribers", {
    authLevel: 'anonymous',
    route: 'foobar/{someInput}',
    handler: foobarHandler
})


// Note: not async
function errorHandler(functionName, error) {

  context.error(`Returning unsuccessfully from ${functionName}`)

  // Errors that aren't ours, e.g.  
  // If the user tried to use the API and did so incorrectly
  if (error instanceof ZodError) {
    context.error('400: User passed incorrect data')
    context.error(err.issues); 
    return {
      status: 400,
      body: error.issues, // Complete information on what the user got wrong and how to fix it
      headers: { "Content-Type": "text/plain" }
    }
  }

  // Uncategorizable errors
  // To be assessed + addressed in upcoming ticket
  // Validate the error itself
  if(!('cause' in error)) {
    const message = `${functionName} returning error without cause. Error: ${JSON.stringify(error)}`
    context.error(message)

    // During dev, crash everything so we can find errors that don't follow the format of always having a cause.
    throw Error(message)

    // During prod, log and return. We can't go down over one error
    // Note re: duplication: two instances is not a pattern
    return {
      status: 500,
      body: "Internal server error. Not to worry: we stay vigilant for these.",
      headers: { "Content-Type": "text/plain" }
    }
  }

  // If 400 for specific reasons, e.g.,
  if(error.cause == 404) {
    return {
      status: 404,
      body: "Not found",
      headers: { "Content-Type": "text/plain" }
    } 
  }

  // or 429
  if(error.cause == 429) {
    context.error(`${functionName}: overuse detected`)
    sendEmailToMeAndJara("429")
    return {
      status: 429,
      body: "We are experiencing a higher than normal volume of usage. We have been automatically notified and are actively looking into the matter.",
      headers: { "Content-Type": "text/plain" }
    } 
  }

  // Catch generic 400 error + other 4xx. log unidentified 4xx error.
  if(400 <= error.cause && error.cause < 500) {
    if(error.cause != 400) { 
      context.error(`Encountered unidentified 4xx error: ${error.cause}`)
    }

    return {
      status: 400,  // Opaque information: correct for 400, no information out for unhandled 4xx
      body: "Bad Request",
      headers: { "Content-Type": "text/plain" }
    }
  }

  // Regarding the lack of conditional on the 500 case:
  // If the error is ours (500) or any other type we're not catching, which we'd like to highlight as a 500
  context.error('foobarHandler: experienced 500 internal server error or uncategorized error')
  context.error(`cause: ${error.cause}`
  context.error(JSON.stringify(error)
  return {
    status: 500,
    body: "Internal server error. Not to worry: we stay vigilant for these.",  // With Viz, we intend to show 500s as a time series + table, much like the first map. 
    headers: { "Content-Type": "text/plain" }
  }
}