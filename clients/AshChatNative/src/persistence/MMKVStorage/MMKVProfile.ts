import { UserProfilePropsDTO } from "./DTO/UserProfilePropsDTO";
import { MMKVStorageTemplate } from "./MMKVStorageTemplate";

export class MMKVStorageProfile extends MMKVStorageTemplate {
    constructor(){
        super();
    }

    public clearToken(): void {
        this.instance.delete(this.CONSTANTS.TOKEN);
    }

    public setToken(token: string): void {
        this.instance.set(this.CONSTANTS.TOKEN, token);
    }

    public getToken(): string | undefined {
        return this.instance.getString(this.CONSTANTS.TOKEN);
    }

    public setUserId(user_id: string): void {
        this.instance.set(this.CONSTANTS.USER_ID, user_id);
    }

    public getUserId(): string | undefined {
        return this.instance.getString(this.CONSTANTS.USER_ID);
    }

    public setUserProfile(userProfile: UserProfilePropsDTO): void {
        this.instance.set(this.CONSTANTS.USER_PROFILE, JSON.stringify(userProfile));
    }
    
    public getUserProfile(): UserProfilePropsDTO | null {
        const userProfileString = this.instance.getString(this.CONSTANTS.USER_PROFILE);
        return userProfileString ? JSON.parse(userProfileString) as UserProfilePropsDTO : null;
    }

    public cleanAll(){
        this.instance.clearAll()
    }
}