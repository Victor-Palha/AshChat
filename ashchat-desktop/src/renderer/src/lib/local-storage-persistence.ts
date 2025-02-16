class LocalStoragePersistence {
    private static KEYS = {
        TOKEN: "ashChat.jwt",
        REFRESH: "ashChat.refresh",
        EMAIL: "ashChat.email",
        UNIQUEDEVICEID: "ashChat.uniqueDeviceId",
        DEVICEOS: "ashChat.deviceOS",
        USERID: "ashChat.userId",
        NOTIFICATIONTOKEN: "ashChat.notificationToken",
        TEMPORARYTOKEN: "ashChat.temporary"
    }
    static clearTokens(){
        localStorage.removeItem(this.KEYS.TOKEN);
        localStorage.removeItem(this.KEYS.REFRESH);
    }
    static setRefreshToken(value: string){
        localStorage.setItem(this.KEYS.REFRESH, value);
    }

    static getRefreshToken(){
        return localStorage.getItem(this.KEYS.REFRESH);
    }

    static setJWT(value: string){
        localStorage.setItem(this.KEYS.TOKEN, value);
    }

    static getJWT(){
        return localStorage.getItem(this.KEYS.TOKEN);
    }

    static setTemporaryToken(value: string){
        localStorage.setItem(this.KEYS.TEMPORARYTOKEN, value);
    }

    static getTemporaryToken(){
        return localStorage.getItem(this.KEYS.TEMPORARYTOKEN);
    }

    static setEmail(value: string){
        localStorage.setItem(this.KEYS.EMAIL, value);
    }

    static getEmail(){
        return localStorage.getItem(this.KEYS.EMAIL);
    }

    static setUniqueDeviceId(value: string){
        localStorage.setItem(this.KEYS.UNIQUEDEVICEID, value);
    }

    static getUniqueDeviceId(){
        return localStorage.getItem(this.KEYS.UNIQUEDEVICEID);
    }

    static setDeviceOS(value: string){
        localStorage.setItem(this.KEYS.DEVICEOS, value);
    }

    static getDeviceOS(){
        return localStorage.getItem(this.KEYS.DEVICEOS);
    }

    static setNotificationToken(value: string){
        localStorage.setItem(this.KEYS.NOTIFICATIONTOKEN, value);
    }

    static getNotificationToken(){
        return localStorage.getItem(this.KEYS.NOTIFICATIONTOKEN);
    }

    static setUserId(value: string){
        localStorage.setItem(this.KEYS.USERID, value);
    }

    static getUserId(){
        return localStorage.getItem(this.KEYS.USERID);
    }

    static clearAll(){
        localStorage.removeItem(this.KEYS.TOKEN);
        localStorage.removeItem(this.KEYS.REFRESH);
        localStorage.removeItem(this.KEYS.EMAIL);
        localStorage.removeItem(this.KEYS.DEVICEOS);
        localStorage.removeItem(this.KEYS.USERID);
    }

    static clearUserId(){
        localStorage.removeItem(this.KEYS.USERID);
    }
}

export default LocalStoragePersistence;