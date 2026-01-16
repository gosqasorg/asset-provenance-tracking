
import { HttpRequest, InvocationContext, HttpResponseInit } from "@azure/functions";

export async function postNotificationEmail(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try{
        const body = await request.json() as any;
        const email = body.email;
        const recordKey= body.recordKey;

        if (!email || !recordKey){
            return {
                jsonBody: {error: "missing data"},
                status: 400
            }
        }
        console.log("Received signup for " + email)
        return {
            jsonBody: {message: "Success"},
            status: 201
        } 
        
    }catch(error){
        console.error(error.message);
        return {
            jsonBody: {message: "Internal Server Error"},
            status: 500,

        }

    }
}