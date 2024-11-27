// Firebase will be used for send notifications to clients 
import * as admin from "firebase-admin";
import { env } from "../env";

type SendNotificationDTO = {
    senderId: string;
    senderNickname: string;
    content: string;
    chatId: string;
    receiverToken: string;
}

class Firebase {
    private config: admin.app.App
    constructor(){
        this.config = admin.initializeApp({
            credential: admin.credential.cert({
                projectId: env.FIREBASE_PROJECT_ID,
                clientEmail: env.FIREBASE_CLIENT_EMAIL,
                privateKey: env.FIREBASE_PRIVATE_KEY
            })
        })
    }

    async sendNotification({ senderId, senderNickname, content, chatId, receiverToken }: SendNotificationDTO){
        // Send notification to client
        await admin.messaging().send({
            notification: {
                title: senderNickname,
                body: content
            },
            data: {
                click_action: "FLUTTER_NOTIFICATION_CLICK",
                sound: "default",
                status: "done",
                senderId: senderId,
                chatId: chatId
            },
            token: "client_token"
        })
    }
}
