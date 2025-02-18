import { MessagePropsDTO } from "./MessagePropsDTO";

export type ChatPropsDTO = {
    id: string;
    nickname: string;
    messages: MessagePropsDTO[];
    profile_picture: string;
    description: string;
    preferred_language: string;
};