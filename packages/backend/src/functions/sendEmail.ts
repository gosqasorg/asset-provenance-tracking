import { EmailClient, KnownEmailSendStatus } from "@azure/communication-email";

const connectionString = process.env['COMMUNICATION_SERVICES_CONNECTION_STRING'];
const emailClient = new EmailClient(connectionString);

// Send an email using the Azure Communication Services Email SDK
export async function sendEmail(from_address: string, to_address: string, subject: string, plainText: string, displayName: string) {
  if (!from_address || !to_address || !subject || !plainText || !displayName) {
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

    console.log("Sending email...", message);
    const poller = await emailClient.beginSend(message);

    // Note: Yes, this seems as though it could be written more simply, and 
    // without the "as any". However, the underlying library contains an
    // error: the interface definition for getOperationState disagrees with
    // the function's implementation. The typedef does not contain isStarted,
    // but empirically, when run, it does. The Azure documentation is correct:
    // the library's interface definition is not. 
    if ((!poller.getOperationState() as any).isStarted) {
      throw "Poller is not started."
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
      console.log(`Successfully sent the email (operation id: ${poller.getResult().id})`);
      return { status: KnownEmailSendStatus.Succeeded, message: message };
    }
    else {
      throw poller.getResult().error;
    }

  } catch (e) {
    console.log(e);
    return { status: "Failed", message: e };
  }

}

