type BackupMessagesDTO = {
    id: string, //chat_id
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