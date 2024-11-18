import { randomUUID } from 'expo-crypto';
import { MMKV } from 'react-native-mmkv';

export type LabelChatProps = {
  chat_id: string;
  nickname: string;
  last_message: MessageProps;
  notification: number;
  last_interaction: Date;
};

export type ChatProps = {
  chat_id: string;
  nickname: string;
  messages: MessageProps[];
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
};

type UpdateMessageStatusProps = {
  chat_id: string;
  id_message: string;
  status: string;
};

export class MMKVStorage {
  private instance: MMKV;

  private CONSTANTS = {
    LABEL_CHAT: 'ashchat.label.chats',
    CHAT: 'ashchat.chat',
    USER_ID: 'ashchat.user_id',
  };

  constructor() {
    this.instance = new MMKV();
  }

  public addChat({ chat_id, messages, nickname }: ChatProps): void {
    const allChatsString = this.instance.getString(this.CONSTANTS.CHAT);

    const newChat: ChatProps = {
      chat_id,
      nickname,
      messages,
    };

    if (allChatsString) {
      const allChats = JSON.parse(allChatsString) as ChatProps[];
      const chatExists = allChats.some(chat => chat.chat_id === chat_id);

      if (!chatExists) {
        const updatedChats = [...allChats, newChat];
        this.instance.set(this.CONSTANTS.CHAT, JSON.stringify(updatedChats));
        this.addLabel({
          chat_id,
          nickname,
          last_message: messages[messages.length - 1],
          notification: 0,
          last_interaction: new Date(),
        });
      }
    } else {
      this.instance.set(this.CONSTANTS.CHAT, JSON.stringify([newChat]));
      this.addLabel({
        chat_id,
        nickname,
        last_message: messages[messages.length - 1],
        notification: 0,
        last_interaction: new Date(),
      });
    }
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

  public getChat(chat_id: string): ChatProps | null {
    const chatsString = this.instance.getString(this.CONSTANTS.CHAT);
    if (chatsString) {
      const chats = JSON.parse(chatsString) as ChatProps[];
      return chats.find(chat => chat.chat_id === chat_id) || null;
    }
    return null;
  }

  public setUserId(user_id: string): void {
    this.instance.set(this.CONSTANTS.USER_ID, user_id);
  }

  public getUserId(): string | undefined {
    return this.instance.getString(this.CONSTANTS.USER_ID);
  }

  public addMessage({ chat_id, content, sender_id }: AddMessageProps): MessageProps | undefined {
    const chatsString = this.instance.getString(this.CONSTANTS.CHAT);
    if (chatsString) {
      const chats = JSON.parse(chatsString) as ChatProps[];
      const chat = chats.find(c => c.chat_id === chat_id);

      if (chat) {
        const newMessage: MessageProps = {
          id_message: randomUUID(),
          content,
          sender_id,
          timestamp: new Date().toISOString(),
          status: 'PENDING',
        };

        chat.messages.push(newMessage);
        this.instance.set(this.CONSTANTS.CHAT, JSON.stringify(chats));
        this.updateLabel({
          chat_id,
          last_message: newMessage,
          notification: sender_id === 'user' ? 0 : 1,
          last_interaction: new Date(),
        });

        return newMessage;
      }
    }
  }

  private updateLabel({
    chat_id,
    last_message,
    notification,
    last_interaction,
  }: Omit<LabelChatProps, 'nickname'>): void {
    const labelsString = this.instance.getString(this.CONSTANTS.LABEL_CHAT);
    if (labelsString) {
      const labels = JSON.parse(labelsString) as LabelChatProps[];
      const updatedLabels = labels.map(label =>
        label.chat_id === chat_id
          ? {
              ...label,
              last_message,
              notification: label.notification + notification,
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
}
