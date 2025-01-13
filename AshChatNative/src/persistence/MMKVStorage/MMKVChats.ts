import { randomUUID } from "expo-crypto";
import { AddMessagePropsDTO } from "./DTO/AddMessagePropsDTO";
import { ChatPropsDTO } from "./DTO/ChatPropsDTO";
import { LabelChatPropsDTO } from "./DTO/LabelChatPropsDTO";
import { MessagePropsDTO } from "./DTO/MessagePropsDTO";
import { MMKVStorageTemplate } from "./MMKVStorageTemplate";
import { UpdateMessageStatusPropsDTO } from "./DTO/UpdateMessageStatusPropsDTO";
import { UserProfilePropsDTO } from "./DTO/UserProfilePropsDTO";

export class MMKVChats extends MMKVStorageTemplate {
    constructor(){
        super();
    }

    public addChat({ chat_id, messages, nickname, profile_picture, description, preferred_language }: ChatPropsDTO): void {
        const allChatsString = this.instance.getString(this.CONSTANTS.CHAT);

        const newChat: ChatPropsDTO = {
            chat_id,
            nickname,
            messages: messages || [],
            profile_picture,
            description,
            preferred_language
        };

        const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1] : null;
        const currentDate = new Date();

        let allChats: ChatPropsDTO[] = [];

        if (allChatsString) {
            allChats = JSON.parse(allChatsString) as ChatPropsDTO[];
            const chatExists = allChats.some(chat => chat.chat_id === chat_id);

            if (chatExists) {
                return;
            }
        }

        allChats.push(newChat);
        this.instance.set(this.CONSTANTS.CHAT, JSON.stringify(allChats));

        this.addLabel({
            chat_id,
            nickname,
            last_message: lastMessage,
            notification: 0,
            last_interaction: currentDate,
            profile_picture
        });
    }

    private addLabel(label: LabelChatPropsDTO): void {
        const labelsString = this.instance.getString(this.CONSTANTS.LABEL_CHAT);
        const newLabels = labelsString
            ? [...JSON.parse(labelsString) as LabelChatPropsDTO[], label]
            : [label];
        this.instance.set(this.CONSTANTS.LABEL_CHAT, JSON.stringify(newLabels));
    }

    public getLabels(): LabelChatPropsDTO[] | null {
        const labelsString = this.instance.getString(this.CONSTANTS.LABEL_CHAT);
        return labelsString ? JSON.parse(labelsString) as LabelChatPropsDTO[] : null;
    }

    public getChat(chat_id: string): { chats: ChatPropsDTO[], searched_chats: ChatPropsDTO | null } | null {
        const chatsString = this.instance.getString(this.CONSTANTS.CHAT);
        if (chatsString) {
            const chats = JSON.parse(chatsString) as ChatPropsDTO[];
            const searched_chats = chats.find(chat => chat.chat_id === chat_id) || null;
            return {
                chats,
                searched_chats, 
            }
        }
        return null;
    }

    public addMessage({ chat_id, content, sender_id, timestamp, isNotification = false }: AddMessagePropsDTO): MessagePropsDTO | undefined {
        const result = this.getChat(chat_id);

        if (!result) {
            if (isNotification) {
                this.addNewChatThroughNotification({ chat_id, content, sender_id, timestamp });
            }
            return;
        }
    
        const { chats, searched_chats } = result;
    
        if (!searched_chats) return;
    
        const newMessage: MessagePropsDTO = {
            id_message: randomUUID(),
            content,
            sender_id,
            timestamp,
            status: 'PENDING',
        };
        //verify if notification message is already in the chat
        const lastMessageOnChat = searched_chats.messages[searched_chats.messages.length - 1];
        const { content: lastContent, timestamp: lastTimestamp } = lastMessageOnChat || {};
        if (lastContent === content && lastTimestamp === newMessage.timestamp) {
            this.updateLabel({
                chat_id,
                last_message: lastMessageOnChat,
                notification: sender_id === 'user' ? 0 : 1,
                last_interaction: new Date(),
            }, isNotification);
            return
        };
        // add message to chat
        searched_chats.messages.push(newMessage);
        this.instance.set(this.CONSTANTS.CHAT, JSON.stringify(chats));
    
        this.updateLabel({
            chat_id,
            last_message: newMessage,
            notification: sender_id === 'user' ? 0 : 1,
            last_interaction: new Date(),
        }, isNotification);
    
        return newMessage;
    }

    private updateLabel({
        chat_id,
        last_message,
        notification,
        last_interaction,
    }: Omit<LabelChatPropsDTO, 'nickname' | 'profile_picture'>, isNotification: boolean): void {
        const labelsString = this.instance.getString(this.CONSTANTS.LABEL_CHAT);
        if (labelsString) {
            const labels = JSON.parse(labelsString) as LabelChatPropsDTO[];
            const updatedLabels = labels.map(label =>
            label.chat_id === chat_id
                ? {
                    ...label,
                    last_message,
                    notification: isNotification ? label.notification + notification : 0,
                    last_interaction,
                }
                : label
            );
            this.instance.set(this.CONSTANTS.LABEL_CHAT, JSON.stringify(updatedLabels));
        }
    }

    private addNewChatThroughNotification({ chat_id, content, sender_id, timestamp }: AddMessagePropsDTO): void {
        const allChatsString = this.instance.getString(this.CONSTANTS.CHAT);
        const allChats = allChatsString ? JSON.parse(allChatsString) as ChatPropsDTO[] : [];

        const newChat: ChatPropsDTO = {
            chat_id,
            nickname: "Unknown",
            messages: [
            {
                id_message: randomUUID(),
                content,
                sender_id,
                timestamp,
                status: 'SENT',
            }
            ],
            profile_picture: 'https://static.vecteezy.com/system/resources/previews/020/765/399/non_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg',
            description: '',
            preferred_language: '',
        };

        allChats.push(newChat);
        this.instance.set(this.CONSTANTS.CHAT, JSON.stringify(allChats));

        this.addLabel({
            chat_id,
            nickname: "Unknown",
            last_message: {
            id_message: randomUUID(),
            content,
            sender_id,
            timestamp,
            status: 'PENDING',
            },
            notification: 1,
            last_interaction: new Date(),
            profile_picture: 'https://static.vecteezy.com/system/resources/previews/020/765/399/non_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg',
        });
    }

    public updateMessageStatus({ chat_id, id_message, status }: UpdateMessageStatusPropsDTO): void {
        const chatsString = this.instance.getString(this.CONSTANTS.CHAT);
        if (chatsString) {
            const chats = JSON.parse(chatsString) as ChatPropsDTO[];
            const chat = chats.find(c => c.chat_id === chat_id);

            if (chat) {
            chat.messages = chat.messages.map(message =>
                message.id_message === id_message
                ? { ...message, status }
                : message
            );

            this.instance.set(this.CONSTANTS.CHAT, JSON.stringify(chats));
            }
        }
    }

    public clearNotifications(chat_id: string): void {
        const chatLabelString = this.instance.getString(this.CONSTANTS.LABEL_CHAT);
        if (chatLabelString) {
            const allChatsLabel = JSON.parse(chatLabelString) as LabelChatPropsDTO[];

            const updatedLabels = allChatsLabel.map(label => 
            label.chat_id === chat_id 
                ? { ...label, notification: 0 } 
                : label
            );
        
            this.instance.set(this.CONSTANTS.LABEL_CHAT, JSON.stringify(updatedLabels));
        }
    }

    private updateChatDetails(chat: ChatPropsDTO, { nickname, photo_url, description, preferred_language }: Omit<UserProfilePropsDTO, "tag_user_id">): ChatPropsDTO {
        return {
          ...chat,
          nickname: chat.nickname !== nickname ? nickname : chat.nickname,
          profile_picture: chat.profile_picture !== photo_url ? "http://localhost:3006"+photo_url : chat.profile_picture,
          description: chat.description !== description ? description : chat.description,
          preferred_language: chat.preferred_language !== preferred_language ? preferred_language : chat.preferred_language,
        };
    }

    public updateChatInformationProfile({ nickname, photo_url, description }: Omit<UserProfilePropsDTO, "tag_user_id">, chat_id: string): void {
        const chatData = this.getChat(chat_id);
        if (!chatData) return;
    
        const { chats, searched_chats } = chatData;
        if (!searched_chats) return;
    
        const updatedChat = this.updateChatDetails(searched_chats, { nickname, photo_url, description, preferred_language: searched_chats.preferred_language });
        this.updateNicknameAndProfilePictureForLabel({ chat_id, nickname, profile_picture: photo_url });
        const updatedChats = chats.map(chat => chat.chat_id === chat_id ? updatedChat : chat);
    
        this.instance.set(this.CONSTANTS.CHAT, JSON.stringify(updatedChats));
    }

    private updateNicknameAndProfilePictureForLabel({ chat_id, nickname, profile_picture }: Omit<LabelChatPropsDTO, 'last_message' | 'notification' | 'last_interaction'>): void {
        const labelsString = this.instance.getString(this.CONSTANTS.LABEL_CHAT);
        if (labelsString) {
          const labels = JSON.parse(labelsString) as LabelChatPropsDTO[];
          const newProfilePicture = `http://localhost:3006${profile_picture}`;
          const updatedLabels = labels.map(label =>
            label.chat_id === chat_id
              ? { ...label, nickname, profile_picture: newProfilePicture }
              : label
          );
          this.instance.set(this.CONSTANTS.LABEL_CHAT, JSON.stringify(updatedLabels));
        }
      }
}