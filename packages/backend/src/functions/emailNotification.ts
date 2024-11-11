import { EmailClient, KnownEmailSendStatus } from "@azure/communication-email";
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as dotenv from 'dotenv';

dotenv.config();

interface EmailMessageContent {
    subject: string;
    plainText: string;
}

interface EmailMessageRecipient {
    address: string;
    displayName: string;
}

export interface EmailMessage {
    senderAddress: string;
    content: EmailMessageContent;
    recipients: {
        to: EmailMessageRecipient[];
    };
}

export async function sendEmailMessage(message: EmailMessage): Promise<void> {
    const POLLER_WAIT_TIME = 10;
    let emailClient;
    try {
        const connectionString = process.env['COMMUNICATION_SERVICES_CONNECTION_STRING'];
        if (!connectionString) {
            throw new Error("Missing environment variable COMMUNICATION_SERVICES_CONNECTION_STRING");
        }
        emailClient = new EmailClient(connectionString);
    }
    catch (e) {
        console.error("Error creating EmailClient:", e);
        throw e;
    }

    try {
        console.log(message);

        if (!message || !message.senderAddress || !message.content || !message.recipients) {
            throw new Error("Invalid email message object");
        }

        // Start email sending process
        const poller = await emailClient.beginSend(message);

        if (!poller.getOperationState().isStarted) {
            throw new Error("Poller was not started.");
        }

        let timeElapsed = 0;
        while (!poller.isDone()) {
            await poller.poll();
            console.log("Email send polling in progress");

            await new Promise(resolve => setTimeout(resolve, POLLER_WAIT_TIME * 1000));
            timeElapsed += POLLER_WAIT_TIME;

            if (timeElapsed > 18 * POLLER_WAIT_TIME) {
                throw new Error("Polling timed out.");
            }
        }

        if (poller.getResult().status === KnownEmailSendStatus.Succeeded) {
            console.log(`Successfully sent the email (operation id: ${poller.getResult().id})`);
        } else {
            throw poller.getResult().error;
        }

    } catch (e) {
        console.error("Error sending email:", e);
        throw e;
    }
}

export async function sendNotification(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const message = await request.json() as EmailMessage;
    try {
        await sendEmailMessage(message);
        return {
            status: 200,
            jsonBody: { message: "Notification sent successfully!" }
        };
    } catch (e) {
        console.error("Error sending notification:", e);
        return {
            status: 500,
            jsonBody: { message: `Failed to send notification.` }
        };
    }
}

app.post("sendNotification", {
    authLevel: 'anonymous',
    route: 'notification',
    handler: sendNotification,
})
