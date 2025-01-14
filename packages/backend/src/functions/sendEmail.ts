import { EmailClient, KnownEmailSendStatus } from "@azure/communication-email";

require("dotenv").config();

// This code demonstrates how to fetch your connection string
// from an environment variable.
// Check the address to your address
const connectionString = process.env['COMMUNICATION_SERVICES_CONNECTION_STRING'];
const emailClient = new EmailClient(connectionString);

export async function sendEmail(from_address: string, to_address: string, subject: string, plainText: string, displayName: string) {
  const POLLER_WAIT_TIME = 10
  try {
    const message = {
      senderAddress: from_address,//"donotreply@6104f838-923b-468b-a2cc-4d5aeaea891a.azurecomm.net",
      content: {
        subject: subject,//"Welcome to Azure Communication Services Email",
        plainText: plainText,//"This is testing email sending function.",
      },
      recipients: {
        to: [
          {
            address: to_address,// "input@gmail.com",
            displayName: displayName,//"Customer Name",
          },
        ],
      },
    };

    console.log("Sending email...", message);

    const poller = await emailClient.beginSend(message);

    if (!poller.getOperationState().isStarted) {
      throw "Poller was not started."
    }

    console.log("Sending...");
    let timeElapsed = 0;
    while (!poller.isDone()) {
      poller.poll();
      console.log("Email send polling in progress");

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

