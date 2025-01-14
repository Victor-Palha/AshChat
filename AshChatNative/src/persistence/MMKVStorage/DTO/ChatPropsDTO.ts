import { MessageProps } from "./MessagePropsDTO";

export type ChatPropsDTO = {
    chat_id: string;
    nickname: string;
    messages: MessageProps[];
    profile_picture: string;
    description: string;
    preferred_language: string;
};