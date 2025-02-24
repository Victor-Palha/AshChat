import { PhoenixAPIClient } from "../api/phoenix-api-client"
import { ChatPropsDTO } from "../persistence/MMKVStorage/DTO/ChatPropsDTO"
import { MessagePropsDTO } from "../persistence/MMKVStorage/DTO/MessagePropsDTO"
import { MMKVChats } from "../persistence/MMKVStorage/MMKVChats"
import { MMKVStorageProfile } from "../persistence/MMKVStorage/MMKVProfile"
import SecureStoragePersistence from "../persistence/SecureStorage"

type ResponseBackupServer = {
    id: string, //chat id
    messages: {
        content: string,
        id: string,
        sender_id: string,
        status: string,
        timestamp: string
        translated_content: string
    }[],
    receiver: {
        id: string,
        description: string,
        preferred_language: string,
        nickname: string,
        photo_url: string,
        tag_user_id: string
    },
    same_language: boolean,
}

export class BackupChat {
    private mmkvProfile: MMKVStorageProfile
    private mmkvChat: MMKVChats
    private secureStorage: typeof SecureStoragePersistence
    private api: typeof PhoenixAPIClient

    constructor(){
        this.mmkvProfile = new MMKVStorageProfile()
        this.secureStorage = SecureStoragePersistence
        this.mmkvChat = new MMKVChats()
        this.api = PhoenixAPIClient
    }

    public async backupMessages(){
        try {
            const {jwtToken, deviceToken, user_id} = await this.loadTokensFromStorage()
            const chats = await this.getBackupFromServer(jwtToken, deviceToken)
            if(!chats) return
            const chatsSeparated = this.separateMessagesToEachChat(chats, user_id)
            chatsSeparated.forEach(chat => {
                this.mmkvChat.addChat(chat)
            })
        } catch (error) {
            console.error("Error backing up messages")
            console.log(error)
        }
    }

    private async loadTokensFromStorage(): Promise<{jwtToken: string; deviceToken: string; user_id: string}> {
        const jwtToken = this.mmkvProfile.getToken()
        const deviceToken = await this.secureStorage.getUniqueDeviceId()
        const user_id = await this.secureStorage.getUserId()

        if(!jwtToken || !deviceToken || !user_id) throw new Error("JWT or Device token not found")
        return {jwtToken, deviceToken, user_id}
    }

    private async getBackupFromServer(jwtToken: string, deviceToken: string): Promise<ResponseBackupServer[] | null>{
        this.api.setTokenAuth(jwtToken);
        this.api.setHeader('device_token', deviceToken);
        const response = await this.api.server.get("/chats")
        const {chats} = response.data as {chats: ResponseBackupServer[] | []}
        if(chats.length === 0) return null
        return chats
    }

    private separateMessagesToEachChat(chats: ResponseBackupServer[], user_id: string): ChatPropsDTO[]{
        const chatsWithMessagesSeparated: ChatPropsDTO[] = chats.map(chat => {
            const separatedMessages = chat.messages.map(message => {
                if(message.sender_id === user_id || chat.same_language === true){
                    const messageProps: MessagePropsDTO = {
                        id_message: message.id,
                        content: message.content,
                        sender_id: message.sender_id,
                        status: message.status,
                        timestamp: message.timestamp
                    }
                    return messageProps
                }
                const messageProps: MessagePropsDTO = {
                    id_message: message.id,
                    content: message.translated_content,
                    sender_id: message.sender_id,
                    status: message.status,
                    timestamp: message.timestamp
                }
                return messageProps
            })
            
            return {
                chat_id: chat.id,
                messages: separatedMessages,
                nickname: chat.receiver.nickname,
                profile_picture: chat.receiver.photo_url,
                description: chat.receiver.description,
                preferred_language: chat.receiver.preferred_language
            }
        })
    
        return chatsWithMessagesSeparated
    }
}