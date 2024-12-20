import { randomUUID } from 'expo-crypto';
import { MMKV } from 'react-native-mmkv';

export type LabelChatProps = {
  chat_id: string;
  nickname: string;
  last_message: MessageProps | null;
  notification: number;
  last_interaction: Date;
  profile_picture: string;
};

export type ChatProps = {
  chat_id: string;
  nickname: string;
  messages: MessageProps[];
  profile_picture: string;
};

export type MessageProps = {
  id_message: string;
  content: string;
  sender_id: string;
  timestamp: string;
  status: string;
};

export type AddMessageProps = {
  chat_id: string;
  content: string;
  sender_id: string;
  timestamp: string;
  isNotification?: boolean;
};

type UpdateMessageStatusProps = {
  chat_id: string;
  id_message: string;
  status: string;
};

export type UserProfileProps = {
  nickname: string;
  description: string;
  photo_url: string;
  preferred_language: string;
  tag_user_id: string;
}

export class MMKVStorage {
  private instance: MMKV;

  private CONSTANTS = {
    LABEL_CHAT: 'ashchat.label.chats',
    CHAT: 'ashchat.chat',
    USER_ID: 'ashchat.user_id',
    USER_PROFILE: 'ashchat.user_profile'
  };

  constructor() {
    this.instance = new MMKV();
  }
  
  public addChat({ chat_id, messages, nickname, profile_picture }: ChatProps): void {
    const allChatsString = this.instance.getString(this.CONSTANTS.CHAT);

    // Cria o novo chat
    const newChat: ChatProps = {
        chat_id,
        nickname,
        messages: messages || [],
        profile_picture
    };

    // Última mensagem (se existir)
    const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1] : null;
    const currentDate = new Date();

    let allChats: ChatProps[] = [];

    if (allChatsString) {
        allChats = JSON.parse(allChatsString) as ChatProps[];
        const chatExists = allChats.some(chat => chat.chat_id === chat_id);

        if (chatExists) {
            return; // Não faz nada se o chat já existe
        }
    }

    // Adiciona o novo chat à lista
    allChats.push(newChat);
    this.instance.set(this.CONSTANTS.CHAT, JSON.stringify(allChats));

    // Adiciona o rótulo para o chat
    this.addLabel({
        chat_id,
        nickname,
        last_message: lastMessage,
        notification: 0,
        last_interaction: currentDate,
        profile_picture
    });
  }

  public getLabels(): LabelChatProps[] | null {
    const labelsString = this.instance.getString(this.CONSTANTS.LABEL_CHAT);
    return labelsString ? JSON.parse(labelsString) as LabelChatProps[] : null;
  }

  private addLabel(label: LabelChatProps): void {
    const labelsString = this.instance.getString(this.CONSTANTS.LABEL_CHAT);
    const newLabels = labelsString
      ? [...JSON.parse(labelsString) as LabelChatProps[], label]
      : [label];
    this.instance.set(this.CONSTANTS.LABEL_CHAT, JSON.stringify(newLabels));
  }

  public getChat(chat_id: string): { chats: ChatProps[], searched_chats: ChatProps | null } | null {
    const chatsString = this.instance.getString(this.CONSTANTS.CHAT);
    if (chatsString) {
      const chats = JSON.parse(chatsString) as ChatProps[];
      const searched_chats = chats.find(chat => chat.chat_id === chat_id) || null;
      return {
        chats,
        searched_chats, 
      }
    }
    return null;
  }

  public setUserId(user_id: string): void {
    this.instance.set(this.CONSTANTS.USER_ID, user_id);
  }

  public getUserId(): string | undefined {
    return this.instance.getString(this.CONSTANTS.USER_ID);
  }

  public addMessage({ chat_id, content, sender_id, timestamp, isNotification = false }: AddMessageProps): MessageProps | undefined {
      const result = this.getChat(chat_id);
      if (!result) return;

      const { chats, searched_chats } = result;

      if (searched_chats) {
        const newMessage: MessageProps = {
          id_message: randomUUID(),
          content,
          sender_id,
          timestamp,
          status: 'PENDING',
        };

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
  }

  public getMessagesFromChat(chat_id: string){
    const result = this.getChat(chat_id);
    if (!result) return;
    const { searched_chats } = result;
    if (!searched_chats) return;
  
    return searched_chats.messages;
  }
  
  private updateLabel({
    chat_id,
    last_message,
    notification,
    last_interaction,
  }: Omit<LabelChatProps, 'nickname' | 'profile_picture'>, isNotification: boolean): void {
    const labelsString = this.instance.getString(this.CONSTANTS.LABEL_CHAT);
    if (labelsString) {
      const labels = JSON.parse(labelsString) as LabelChatProps[];
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

  public updateMessageStatus({ chat_id, id_message, status }: UpdateMessageStatusProps): void {
    const chatsString = this.instance.getString(this.CONSTANTS.CHAT);
    if (chatsString) {
      const chats = JSON.parse(chatsString) as ChatProps[];
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
      const allChatsLabel = JSON.parse(chatLabelString) as LabelChatProps[];

      const updatedLabels = allChatsLabel.map(label => 
        label.chat_id === chat_id 
          ? { ...label, notification: 0 } 
          : label
      );
  
      this.instance.set(this.CONSTANTS.LABEL_CHAT, JSON.stringify(updatedLabels));
    }
  }

  public setUserProfile(userProfile: UserProfileProps): void {
    this.instance.set(this.CONSTANTS.USER_PROFILE, JSON.stringify(userProfile));
  }

  public getUserProfile(): UserProfileProps | null {
    const userProfileString = this.instance.getString(this.CONSTANTS.USER_PROFILE);
    return userProfileString ? JSON.parse(userProfileString) as UserProfileProps : null;
  }

  public cleanAll(){
    this.instance.clearAll()
  }
}
