import { AuthAPIClient } from "@/src/api/auth-api-client";
import { PhoenixAPIClient } from "@/src/api/phoenix-api-client";
import { MMKVStorageProfile } from "@/src/persistence/MMKVStorage/MMKVProfile"
import SecureStoragePersistence from "@/src/persistence/SecureStorage"
import { randomUUID } from "expo-crypto";
import { Platform } from "react-native";

type PersistenceProfileDataDTO = {
    token: string,
    refresh_token: string,
    user_id: string,
    email: string,
    platform: string
}

type PersistenceAfterRegisterDTO = {
    email: string,
    deviceTokenId: string | null,
}

type ValidatedRefreshTokenDTO = {
    token: string,
    refresh_token: string
}

type SaveUserProfileDTO = {
    nickname: string,
    description: string,
    photo_url: string,
    preferred_language: string,
    tag_user_id: string
}

export class AuthModelContext {
    public static async getStoredTokens(){
        const refresh_token = await SecureStoragePersistence.getRefreshToken();
        let deviceTokenId = await SecureStoragePersistence.getUniqueDeviceId();
        if(!deviceTokenId) {
            deviceTokenId = randomUUID();
            await SecureStoragePersistence.setUniqueDeviceId(deviceTokenId)
        };
        const jwt_token = await SecureStoragePersistence.getJWT();
        const user_id = await SecureStoragePersistence.getUserId();
        const user_email = await SecureStoragePersistence.getEmail();
        const deviceNotificationToken = await SecureStoragePersistence.getNotificationToken();
        const authAPI = AuthAPIClient;
        const chatAPI = PhoenixAPIClient;

        return {
            refresh_token,
            jwt_token,
            deviceTokenId,
            user_id,
            user_email,
            deviceNotificationToken,
            authAPI,
            chatAPI
        }
    }

    public static async persistenceProfileData(data: PersistenceProfileDataDTO){
        const MMKVProfile = new MMKVStorageProfile();
        await SecureStoragePersistence.setJWT(data.token);
        await SecureStoragePersistence.setRefreshToken(data.refresh_token);
        await SecureStoragePersistence.setUserId(data.user_id);
        await SecureStoragePersistence.setEmail(data.email);
        await SecureStoragePersistence.setDeviceOS(data.platform);
        MMKVProfile.setUserId(data.user_id);
        MMKVProfile.setToken(data.token);
    }

    public static async persistenceAfterRegister(data: PersistenceAfterRegisterDTO){
        const deviceTokenId = data.deviceTokenId || randomUUID();
        await SecureStoragePersistence.setEmail(data.email);
        await SecureStoragePersistence.setDeviceOS(Platform.OS);
        await SecureStoragePersistence.setUniqueDeviceId(deviceTokenId);
    }

    public static async deleteStoredTokens(){
        const MMKVProfile = new MMKVStorageProfile();
        await SecureStoragePersistence.clearAll();
        MMKVProfile.cleanAll();
    }

    public static async validatedRefreshToken(data: ValidatedRefreshTokenDTO){
        const MMKVProfile = new MMKVStorageProfile();
        await SecureStoragePersistence.setJWT(data.token);
        await SecureStoragePersistence.setRefreshToken(data.refresh_token);
        MMKVProfile.setToken(data.token);
    }

    public static async saveUserProfile(data: SaveUserProfileDTO){
        const MMKVProfile = new MMKVStorageProfile();
        MMKVProfile.setUserProfile(data);
    }

    public static async newDeviceTryingToLogin(temporatyToken: string){
        await SecureStoragePersistence.setTemporaryToken(temporatyToken);
    }

    public static async getTemporaryToken(): Promise<string | null>{
        return await SecureStoragePersistence.getTemporaryToken();
    }
}