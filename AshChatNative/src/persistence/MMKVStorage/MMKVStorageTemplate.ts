import { MMKV } from "react-native-mmkv";

export class MMKVStorageTemplate {
    protected instance: MMKV;
    
    protected CONSTANTS = {
        LABEL_CHAT: 'ashchat.label.chats',
        CHAT: 'ashchat.chat',
        USER_ID: 'ashchat.user_id',
        USER_PROFILE: 'ashchat.user_profile',
        TOKEN: 'ashchat.jwt',
    };

    constructor() {
        this.instance = new MMKV();
    }

}