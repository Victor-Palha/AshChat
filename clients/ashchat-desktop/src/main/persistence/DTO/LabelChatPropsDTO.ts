import { MessagePropsDTO } from "./MessagePropsDTO";

export type LabelChatPropsDTO = {
    chat_id: string;
    nickname: string;
    last_message: MessagePropsDTO | null;
    notification: number;
    last_interaction: Date | null;
    profile_picture: string;
};