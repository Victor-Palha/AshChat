export type AddMessagePropsDTO = {
    chat_id: string;
    content: string;
    sender_id: string;
    timestamp: string;
    isNotification?: boolean;
};