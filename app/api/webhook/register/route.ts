import {Webhook} from "svix";
import {headers} from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";



export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        throw new Error("Please add webhook secret in the env file.")
    }

    const headerPayload = headers();
    const svix_id = (await headerPayload).get("svid-id");
    const svix_timestamp = (await headerPayload).get("svix-timestamp");
    const svix_signature = (await headerPayload).get("svix-signature");

    if (!svix_id || !svix_signature || !svix_timestamp) {
        throw new Response("Error occurred - No Svix headers!")
    };

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(WEBHOOK_SECRET);
    
    let evt: WebhookEvent;

    try {
        evt = wh.verify(body, {
            "svix_id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature
        }) as WebhookEvent;
    } catch (err) {
        console.error("Error verifying Webhook");
        return new Response("Error occurred", {status: 400})
    }

    const {id} = evt.data;
    const eventType = evt.type;

    if (eventType === "user.created") {
        try {
            const {email_addresses, primary_email_address_id} = evt.data;
            console.log("EventType info is here: ", email_addresses, primary_email_address_id);
            
            const primaryEmail = email_addresses.find(
                (email) => email.id === primary_email_address_id
            )

            if (!primaryEmail) {
                return new Response("No primary email found", {status: 400});
            }

            //create a neon user
            await prisma.user.create({
                data: {
                    id: evt.data.id!,
                    email: primaryEmail.email_address,
                    isSubscribed: false
                }
            });

            console.log("New User created !");
            
        } catch (error) {
            return new Response("No primary email found", {status: 400});
        }
    }

    return new Response("Webhook received successfully", {status: 200});
}
