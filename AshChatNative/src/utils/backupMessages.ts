import { PhoenixAPIClient } from "../api/phoenix-api-client"
import { ChatProps, MessageProps, MMKVStorage } from "../persistence/MMKVStorage"
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
export async function backupMessages(){
    const MMKV = new MMKVStorage
    const SecureStorage = SecureStoragePersistence
    const API = PhoenixAPIClient
    const jwtToken = MMKV.getToken()
    const deviceToken = await SecureStorage.getUniqueDeviceId()
    if(!jwtToken || !deviceToken) throw new Error("JWT or Device token not found")
    try {
        const backup = await getBackup(API, jwtToken, deviceToken)
        const user_id = await SecureStorage.getUserId()
        if(!backup || !user_id) return
        const chats = separateMessages(backup, user_id)
        chats.forEach(chat => {
            MMKV.addChat(chat)
        })
    } catch (error) {
        console.log("backupMessages error")
        console.log(error)
    }

}

async function getBackup(api: typeof PhoenixAPIClient, jwtToken: string, deviceToken: string): Promise<ResponseBackupServer[] | null>{
    api.setTokenAuth(jwtToken);
    api.setHeader('device_token', deviceToken);
    const response = await api.server.get("/chats")
    const {chats} = response.data as {chats: ResponseBackupServer[] | []}
    if(chats.length === 0) return null
    return chats
}

function separateMessages(chats: ResponseBackupServer[], user_id: string): ChatProps[]{
    const chatsWithMessagesSeparated: ChatProps[] = chats.map(chat => {
        const separatedMessages = chat.messages.map(message => {
            if(message.sender_id === user_id || chat.same_language === true){
                const messageProps: MessageProps = {
                    id_message: message.id,
                    content: message.content,
                    sender_id: message.sender_id,
                    status: message.status,
                    timestamp: message.timestamp
                }
                return messageProps
            }
            const messageProps: MessageProps = {
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