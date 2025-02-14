import { PhoenixAPIClient } from "../../lib/api/phoenix-api-client";
import LocalStoragePersistence from "../../lib/local-storage-persistence";

type IncomeNotificationDTO = {
    chat_id: string,
    sender_id: string,
    content: string,
    timestamp: string,
    isNotification?: boolean
}

export class ChatModelContext {
    public static async getStoredTokens(){
        const refresh_token = LocalStoragePersistence.getRefreshToken();
        let deviceTokenId = LocalStoragePersistence.getUniqueDeviceId();
        const jwt_token = LocalStoragePersistence.getJWT();
        const user_id = LocalStoragePersistence.getUserId();
        const user_email = LocalStoragePersistence.getEmail();
        const deviceNotificationToken = LocalStoragePersistence.getNotificationToken();
        const chatAPI = PhoenixAPIClient;

        return {
            refresh_token,
            jwt_token,
            deviceTokenId,
            user_id,
            user_email,
            deviceNotificationToken,
            chatAPI
        }
    }

    public static async getUserPreferredLanguage(){
        const user = await window.userApi.getUser();
        if (!user) return "en";
        return user.preferred_language;
    }

    public static async handleIncomingNotification(notification: IncomeNotificationDTO){
        const { chat_id, sender_id, content, timestamp, isNotification = true } = notification;
        await window.chatApi.addMessage({
            chat_id,
            content,
            sender_id,
            timestamp,
            isNotification
        })
    }
}