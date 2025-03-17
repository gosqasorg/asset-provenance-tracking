import { EmailClient, KnownEmailSendStatus } from "@azure/communication-email";
import { InvocationContext } from "@azure/functions";

const connectionString = 'endpoint=https://ben-comms-services.unitedstates.communication.azure.com/;accesskey=17MXXZ027eLbLLBFI9SORRbydrgWTDRoZk8syVAq4xuU6yZqTfkuJQQJ99BAACULyCpL2lOYAAAAAZCSDTWI'//process.env['COMMUNICATION_SERVICES_CONNECTION_STRING'];

if (connectionString === undefined) {
  throw Error("COMMUNICATION_SERVICES_CONNECTION_STRING is not defined.");
}

const emailClient = new EmailClient(connectionString);

// Send an email using the Azure Communication Services Email SDK
export async function sendEmail(context: InvocationContext, from_address: string, to_address: string, subject: string, plainText: string, displayName: string) {
  if (!context || !from_address || !to_address || !subject || !plainText || !displayName) {
    throw "Missing required parameter(s).";
  }

  const POLLER_WAIT_TIME = 10
  try {
    const message = {
      senderAddress: from_address,
      content: {
        subject: subject,
        plainText: plainText,
      },
      recipients: {
        to: [
          {
            address: to_address,
            displayName: displayName,
          },
        ],
      },
    };

    context.log("Sending email...", message);
    const poller = await emailClient.beginSend(message);

    if (!poller.getOperationState().isStarted) {
      throw "Poller was not started."
    }

    let timeElapsed = 0;
    while (!poller.isDone()) {
      poller.poll();

      await new Promise(resolve => setTimeout(resolve, POLLER_WAIT_TIME * 1000));
      timeElapsed += 10;

      if (timeElapsed > 18 * POLLER_WAIT_TIME) {
        throw "Polling timed out.";
      }
    }

    if (poller.getResult().status === KnownEmailSendStatus.Succeeded) {
      context.log(`Successfully sent the email (operation id: ${poller.getResult().id})`);
      return { status: KnownEmailSendStatus.Succeeded, message: message };
    }
    else {
      throw poller.getResult().error;
    }

  } catch (e) {
    context.log(e);
    return { status: "Failed", message: e };
  }

}

