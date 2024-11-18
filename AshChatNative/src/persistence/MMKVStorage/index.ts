import { randomUUID } from 'expo-crypto'
import { MMKV } from 'react-native-mmkv'

export type LabelChatProps = {
    chat_id: string
    nickname: string
    last_message: MessageProps
    notification: number
    last_interaction: Date
}

export type ChatProps = {
    chat_id: string
    nickname: string
    messages: MessageProps[]
}

export type MessageProps = {
    id_message: string
    content: string
    sender_id: string
    timestamp: string
    status: string
}

type AddMessageProps = {
    chat_id: string,
    content: string
}

type UpdateMessageStatusProps = {
    chat_id: string
    id_message: string
    status: string
}
export class MMKVStorage {
    private instance: MMKV

    private CONSTANST = {
        LABEL_CHAT: 'ashchat.label.chats',
        CHAT: 'ashchat.chat',
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
            const chats = JSON.parse(allChats) as ChatProps[]
            const chatExists = chats.find(chat => chat.chat_id === chat_id)

            if(chatExists){
                return
            }

            const updatedChats = [...chats, newChat]

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
        const chats = [newChat]
        
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
            const chats = JSON.parse(allChats) as LabelChatProps[]
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
            const chats = JSON.parse(allChats) as LabelChatProps[]
            const chatExists = chats.find(chat => chat.chat_id === chat_id)

            if(chatExists){
                return
            }

            const updatedChats = [...chats, newLabel]
            

            this.instance.set(this.CONSTANST.LABEL_CHAT, JSON.stringify(updatedChats))
            return
        }

        // If there is no chats yet
        const chats = [newLabel]
        

        this.instance.set(this.CONSTANST.LABEL_CHAT, JSON.stringify(chats))
    }

    public getChat(chat_id: string){
        const allChats = this.instance.getString(this.CONSTANST.CHAT)
        if(allChats){
            const chats = JSON.parse(allChats) as ChatProps[]
            const chat = chats.find(chat => chat.chat_id === chat_id)
            return chat
        }
        return null
    }

    public addMessage({chat_id, content}: AddMessageProps){
        const allChats = this.instance.getString(this.CONSTANST.CHAT)
        if(allChats){
            const chats = JSON.parse(allChats) as ChatProps[]
            const chat = chats.find(chat => chat.chat_id === chat_id)
            if(chat){
                const timestamp = new Date().toISOString()
                const newMessage: MessageProps = {
                    id_message: randomUUID(),
                    content,
                    sender_id: 'user',
                    timestamp,
                    status: 'PENDING'
                }

                const updatedMessages = [...chat.messages, newMessage]
                const updatedChat = {
                    ...chat,
                    messages: updatedMessages
                }

                const otherChats = chats.filter(chat => chat.chat_id !== chat_id)
                const updatedChats = [...otherChats, updatedChat]
                this.instance.set(this.CONSTANST.CHAT, JSON.stringify(updatedChats))
                this.updateLabel({
                    chat_id,
                    last_message: newMessage,
                    notification: 1,
                    last_interaction: new Date(),
                })

                return newMessage
            }
        }
    }

    private updateLabel({chat_id, last_message, notification, last_interaction}: Omit<LabelChatProps, 'nickname'>){
        const chatLabels = this.instance.getString(this.CONSTANST.LABEL_CHAT)
        if(chatLabels){
            const labels = JSON.parse(chatLabels) as LabelChatProps[]
            const updatedLabels = labels.map(label => {
                if(label.chat_id === chat_id){
                    return {
                        chat_id,
                        nickname: label.nickname,
                        last_message,
                        notification: label.notification + notification,
                        last_interaction
                    }
                }
                return label
            })
            this.instance.set(this.CONSTANST.LABEL_CHAT, JSON.stringify(updatedLabels))
        }
    }

    public updateMessageStatus({chat_id, id_message, status}: UpdateMessageStatusProps){
        const allChats = this.instance.getString(this.CONSTANST.CHAT)
        if(allChats){
            const chats = JSON.parse(allChats) as ChatProps[]
            const chat = chats.find(chat => chat.chat_id === chat_id)
            if(chat){
                const updatedMessages = chat.messages.map(message => {
                    if(message.id_message === id_message){
                        return {
                            ...message,
                            status
                        }
                    }
                    return message
                })

                const updatedChat = {
                    ...chat,
                    messages: updatedMessages
                }

                const otherChats = chats.filter(chat => chat.chat_id !== chat_id)
                const updatedChats = [...otherChats, updatedChat]
                this.instance.set(this.CONSTANST.CHAT, JSON.stringify(updatedChats))
            }
        }
    }
}