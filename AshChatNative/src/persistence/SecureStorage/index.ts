import * as SecureStore from 'expo-secure-store';

class SecureStoragePersistence {
    private static KEYS = {
        TOKEN: "@ashChat/jwt",
        EMAIL: "@ashChat/email",
        UNIQUEDEVICEID: "@ashChat/uniqueDeviceId",
        DEVICEOS: "@ashChat/deviceOS",
        USERID: "@ashChat/userId",
    }

    static async setJWT(value: string){
        await SecureStore.setItemAsync(this.KEYS.TOKEN, value);
    }

    static async getJWT(): Promise<string | null>{
        return await SecureStore.getItemAsync(this.KEYS.TOKEN);
    }

    static async setEmail(value: string){
        await SecureStore.setItemAsync(this.KEYS.EMAIL, value);
    }

    static async getEmail(): Promise<string | null>{
        return await SecureStore.getItemAsync(this.KEYS.EMAIL);
    }

    static async setUniqueDeviceId(value: string){
        await SecureStore.setItemAsync(this.KEYS.UNIQUEDEVICEID, value);
    }

    static async getUniqueDeviceId(): Promise<string | null>{
        return await SecureStore.getItemAsync(this.KEYS.UNIQUEDEVICEID);
    }

    static async setDeviceOS(value: string){
        await SecureStore.setItemAsync(this.KEYS.DEVICEOS, value);
    }

    static async getDeviceOS(): Promise<string | null>{
        return await SecureStore.getItemAsync(this.KEYS.DEVICEOS);
    }
}

export default SecureStoragePersistence;