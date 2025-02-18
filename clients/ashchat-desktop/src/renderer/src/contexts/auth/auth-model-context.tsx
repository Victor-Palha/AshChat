import { v4 as randomUUID } from "uuid";
import { AuthAPIClient } from "../../lib/api/auth-api-client"
import { PhoenixAPIClient } from "../../lib/api/phoenix-api-client"
import LocalStoragePersistence from "../../lib/local-storage-persistence"

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
    public static getStoredTokens(){
        const refresh_token = LocalStoragePersistence.getRefreshToken();
        let deviceTokenId = LocalStoragePersistence.getUniqueDeviceId();
        let deviceNotificationToken = LocalStoragePersistence.getNotificationToken();
        if(!deviceTokenId) {
            deviceTokenId = randomUUID();
            LocalStoragePersistence.setUniqueDeviceId(deviceTokenId)
        };
        if(!deviceNotificationToken) {
            deviceNotificationToken = randomUUID();
            LocalStoragePersistence.setNotificationToken(deviceNotificationToken);
        }
        const jwt_token = LocalStoragePersistence.getJWT();
        const user_id = LocalStoragePersistence.getUserId();
        const user_email = LocalStoragePersistence.getEmail();
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

    public static persistenceProfileData(data: PersistenceProfileDataDTO){
        // const MMKVProfile = new MMKVStorageProfile();
        LocalStoragePersistence.setJWT(data.token);
        LocalStoragePersistence.setRefreshToken(data.refresh_token);
        LocalStoragePersistence.setUserId(data.user_id);
        LocalStoragePersistence.setEmail(data.email);
        LocalStoragePersistence.setDeviceOS(data.platform);
        // MMKVProfile.setUserId(data.user_id);
        // MMKVProfile.setToken(data.token);
    }

    public static persistenceAfterRegister(data: PersistenceAfterRegisterDTO){
        const deviceTokenId = data.deviceTokenId || randomUUID();
        LocalStoragePersistence.setEmail(data.email);
        const os = "Electron"
        LocalStoragePersistence.setDeviceOS(os);
        LocalStoragePersistence.setUniqueDeviceId(deviceTokenId);
    }

    public static deleteStoredTokens(){
        // const MMKVProfile = new MMKVStorageProfile();
        LocalStoragePersistence.clearAll();
        // MMKVProfile.cleanAll();
    }

    public static validatedRefreshToken(data: ValidatedRefreshTokenDTO){
        // const MMKVProfile = new MMKVStorageProfile();
        LocalStoragePersistence.setJWT(data.token);
        LocalStoragePersistence.setRefreshToken(data.refresh_token);
        // MMKVProfile.setToken(data.token);
    }

    public static async saveUserProfile(data: SaveUserProfileDTO){
        // const MMKVProfile = new MMKVStorageProfile();
        // MMKVProfile.setUserProfile(data);
    }

    public static newDeviceTryingToLogin(temporatyToken: string){
        LocalStoragePersistence.setTemporaryToken(temporatyToken);
    }

    public static getTemporaryToken(): string | null{
        return LocalStoragePersistence.getTemporaryToken();
    }
}