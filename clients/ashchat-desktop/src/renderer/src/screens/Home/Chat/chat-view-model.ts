import { Channel, Socket } from "phoenix";
import { FormEvent, useCallback, useContext, useEffect, useState } from "react";
import { ChatContext } from "../../../contexts/chat/chatContext";
import { MessagePropsDTO } from "main/persistence/DTO/MessagePropsDTO";
import { AddMessagePropsDTO } from "main/persistence/DTO/AddMessagePropsDTO";
import { API_URLS } from "../../../constants/api-urls";
import LocalStoragePersistence from "../../../lib/local-storage-persistence";

type ModalDescriptionProps = {
    nickname: string;
    description: string;
    tag_user_id: string;
    photo_url: string;
}

type MessageWasSendProps = {
    chat_id: string;
    status: string;
    mobile_ref_id: string;
}

type OtherSideChatInformationProps = {
    description: string;
    nickname: string;
    photo_url: string;
    preferred_language: string;
    tag_user_id: string;
}

type ChatViewModelProps = {
    chat_id: string | string[]
}

export function ChatViewModel({chat_id}: ChatViewModelProps){
    const { socket, user_id } = useContext(ChatContext);
    //states
    const [isUserTyping, setIsUserTyping] = useState<boolean>(false);
    const [channel, setChannel] = useState<Channel | null>(null);
    const [messages, setMessages] = useState<MessagePropsDTO[]>([]);
    const [inputMessage, setInputMessage] = useState<string>("");
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [isReceiverOnline, setIsReceiverOnline] = useState<boolean>(false);
    const [isModalDescriptionOpen, setIsModalDescriptionOpen] = useState(false);
    const [modalDescriptionProps, setModalDescriptionProps] = useState<ModalDescriptionProps | null>(null);

    // Events handlers
    function handleChannelsConnections(socket: Socket | undefined){
        if (!socket) return;
        const chatChannel = socket.channel(`chat:${chat_id}`, {});
        chatChannel
            .join()
            .receive("ok", () => {})
            .receive("error", () => {});
        setChannel(chatChannel);
        return chatChannel;
    }

    async function handleReceiverMessage(messageFromServer: AddMessagePropsDTO){
        const who = messageFromServer.sender_id === user_id ? "user" : "contact";

        const newMessage = await window.chatApi.addMessage({
            chat_id: chat_id as string,
            content: messageFromServer.content,
            sender_id: who,
            timestamp: new Date().toISOString(),
        })

        setMessages((prevMessages) => [newMessage, ...prevMessages]);
    }

    async function handleVerifyIfMessageWasSend({ status, mobile_ref_id }: MessageWasSendProps){
        await window.messageApi.updateMessageStatus({ id_message: mobile_ref_id, status });
    }

    function handleVerificationIfOtherSideIsTyping({is_typing}: any) {
        setIsUserTyping(is_typing);
    };

    function handleTrackIfOtherSideIsOnline({ status }: { status: boolean }) {
        setIsReceiverOnline(status);
    }

    async function handleRecoverOtherSideInformation({description, nickname, photo_url, preferred_language, tag_user_id}: OtherSideChatInformationProps){
        setModalDescriptionProps({description, nickname, photo_url, tag_user_id});
        await window.chatApi.updateChatInformationProfile({description, nickname, photo_url, chat_id: chat_id as string});
    }
    // handle local states
    async function handleGetOlderMessages(chat_id: string, offset: number){
        const chat = await window.chatApi.getChat(chat_id);
        if (!chat) return [];
        if (offset >= chat.messages.length) return [];
        if (chat.messages.length <= 20) return [];

        const oldMessages = chat.messages.slice(offset, offset + 20).reverse();
        if (oldMessages.length > 0) {
            setMessages((prevMessages) => [...prevMessages, ...oldMessages]);
        }
    }

    function handleWriteMessage(message: string) {
        handleTypingTrack(true);
        setInputMessage(message);
        if (message.length === 0) handleTypingTrack(false);
    }

    async function handleSendMessage(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (inputMessage.trim()) {
            const userId = LocalStoragePersistence.getUserId() as string;
            const newMessage = await window.chatApi.addMessage({
                chat_id: chat_id as string,
                content: inputMessage,
                sender_id: userId,
                timestamp: new Date().toISOString(),
            })

          channel?.push("send_message", { mobile_ref_id: newMessage.id, content: inputMessage });
          setMessages((prevMessages) => [newMessage, ...prevMessages]);
          setInputMessage("");
          handleTypingTrack(false);
        }
    }

    function handleTypingTrack(isTyping: boolean) {
        channel?.push("typing", {
          "is_typing": isTyping,
        });
    }

    function handleOpenAndCloseModalDescription(){
        setIsModalDescriptionOpen(!isModalDescriptionOpen);
    }

    function handleCloseChat(){
        channel?.leave();
    }

    function handleNormalizeDate(timestamp: string): string {
        const date = new Date(timestamp);
        date.setHours(0, 0, 0, 0);
        return date.toISOString();
    }
    
    function handleGroupMessages(messages: MessagePropsDTO[]): MessagePropsDTO[] {
        if (messages.length === 0) return [];
    
        const groupedByDate: { [date: string]: MessagePropsDTO[] } = {};
    
        messages.forEach((message) => {
            const messageDate = handleNormalizeDate(message.timestamp.toISOString());
    
            if (!groupedByDate[messageDate]) {
                groupedByDate[messageDate] = []; 
            }
    
            groupedByDate[messageDate].push(message);
        });
    
        const groupedMessages: MessagePropsDTO[] = [];
        Object.keys(groupedByDate).forEach((date) => {
            groupedMessages.push(...groupedByDate[date]);
        });
    
        return groupedMessages.reverse();
    }
    // Load chat messages and divide into chunks
    async function loadChatMessages() {
        const response = await window.chatApi.getChat(chat_id as string);
        // console.log(response);
        if (!response) return;

        const profilePhoto = response.profile_picture;

        window.labelApi.clearNotifications(chat_id as string);
        setProfilePicture(profilePhoto);
            // Ordena as mensagens por timestamp
        const sortedMessages = response.messages.sort(
            //@ts-ignore
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    
        setMessages(sortedMessages);
    }
    useEffect(() => {
        loadChatMessages();
    }, [chat_id]);

    // Event listeners
    useEffect(() => {
            const chatChannel = handleChannelsConnections(socket)
            if (!chatChannel) return;
            // events listeners
            chatChannel.on("receive_message", handleReceiverMessage);
            chatChannel.on("message_sent", handleVerifyIfMessageWasSend);
            chatChannel.on("typing", handleVerificationIfOtherSideIsTyping);
            chatChannel.on("receiver_online", handleTrackIfOtherSideIsOnline);
            chatChannel.on("receiver_info", handleRecoverOtherSideInformation);

            // Remove event listeners when the screen is unfocused
            return () => {
                chatChannel.leave();
                chatChannel.off("receive_message");
                chatChannel.off("message_sent");
                chatChannel.off("typing");
                chatChannel.off("receiver_online");
                chatChannel.off("receiver_info");
            };
    }, [chat_id, socket, user_id]);

    const values = {
        isUserTyping,
        channel,
        messages,
        inputMessage,
        profilePicture,
        isReceiverOnline,
        isModalDescriptionOpen,
        modalDescriptionProps,
        handleCloseChat,
        handleGetOlderMessages,
        handleWriteMessage,
        handleSendMessage,
        handleTypingTrack,
        handleOpenAndCloseModalDescription,
        handleGroupMessages,
        handleNormalizeDate
    }

    return values;
}