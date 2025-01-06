import { PhoenixAPIClient } from "@/src/api/phoenix-api-client";
import { MMKVChats } from "@/src/persistence/MMKVStorage/MMKVChats";
import { MMKVStorageProfile } from "@/src/persistence/MMKVStorage/MMKVProfile";
import SecureStoragePersistence from "@/src/persistence/SecureStorage";

type IncomeNotificationDTO = {
    chat_id: string,
    sender_id: string,
    content: string,
    timestamp: string,
    isNotification?: boolean
}

export class ChatModelContext {
    public static async getStoredTokens(){
        const refresh_token = await SecureStoragePersistence.getRefreshToken();
        let deviceTokenId = await SecureStoragePersistence.getUniqueDeviceId();
        const jwt_token = await SecureStoragePersistence.getJWT();
        const user_id = await SecureStoragePersistence.getUserId();
        const user_email = await SecureStoragePersistence.getEmail();
        const deviceNotificationToken = await SecureStoragePersistence.getNotificationToken();
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
        const MMKVProfile = new MMKVStorageProfile().getUserProfile();
        return MMKVProfile?.preferred_language;
    }

    public static handleIncomingNotification(notification: IncomeNotificationDTO){
        const { chat_id, sender_id, content, timestamp, isNotification = true } = notification;
        const MMKVProfile = new MMKVChats();
        MMKVProfile.addMessage({
            chat_id,
            content,
            sender_id,
            timestamp,
            isNotification
        })
    }
}