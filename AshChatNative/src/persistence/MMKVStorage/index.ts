import { MMKV } from 'react-native-mmkv'

type ChatsStorage = {
    data: ChatProps[]
}

type LabelChatProps = {
    chat_id: string
    nickname: string
    last_message: MessageProps
    notification: number
    last_interaction: Date
}

type ChatProps = {
    chat_id: string
    nickname: string
    messages: MessageProps[]
}

type MessageProps = {
    id_message: string
    content: string
    sender_id: string
    timestamp: string
    status: string
}

export class MMKVStorage {
    private instance: MMKV

    private CONSTANST = {
        LABEL_CHAT: 'ashchat.label.chats',
        CHAT: 'ashchat.chat',
        MESSAGES: 'ashchat.messages'
    }
    constructor(){
        this.instance = new MMKV()
    }

    public addChat({chat_id, messages, nickname}: ChatProps){
        const newChat = {
            chat_id,
            nickname,
            messages
        }

        const allChats = this.instance.getString(this.CONSTANST.CHAT)
        if(allChats){
            const chats = JSON.parse(allChats) as ChatsStorage
            const chatExists = chats.data.find(chat => chat.chat_id === chat_id)

            if(chatExists){
                return
            }

            const updatedChats = {
                data: [...chats.data, newChat]
            }

            this.instance.set(this.CONSTANST.CHAT, JSON.stringify(updatedChats))
            this.addLabel({
                chat_id,
                nickname,
                last_message: messages[messages.length - 1],
                notification: 0,
                last_interaction: new Date()
            })
            return
        }

        // If there is no chats yet
        const chats = {
            data: [newChat]
        }
        this.addLabel({
            chat_id,
            nickname,
            last_message: messages[messages.length - 1],
            notification: 0,
            last_interaction: new Date()
        })

        this.instance.set(this.CONSTANST.CHAT, JSON.stringify(chats))
    }

    public getLabels(){
        const allChats = this.instance.getString(this.CONSTANST.LABEL_CHAT)
        if(allChats){
            const chats = JSON.parse(allChats) as ChatsStorage
            return chats
        }
        return null
    }

    private addLabel({chat_id, nickname, last_message, notification, last_interaction}: LabelChatProps){
        const newLabel = {
            chat_id,
            nickname,
            last_message,
            notification,
            last_interaction
        }

        const allChats = this.instance.getString(this.CONSTANST.LABEL_CHAT)
        if(allChats){
            const chats = JSON.parse(allChats) as ChatsStorage
            const chatExists = chats.data.find(chat => chat.chat_id === chat_id)

            if(chatExists){
                return
            }

            const updatedChats = {
                data: [...chats.data, newLabel]
            }

            this.instance.set(this.CONSTANST.LABEL_CHAT, JSON.stringify(updatedChats))
            return
        }

        // If there is no chats yet
        const chats = {
            data: [newLabel]
        }

        this.instance.set(this.CONSTANST.LABEL_CHAT, JSON.stringify(chats))
    }


}