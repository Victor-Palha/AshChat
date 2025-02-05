import { ChatContext } from "@/src/contexts/chat/chatContext";
import { AddMessagePropsDTO } from "@/src/persistence/MMKVStorage/DTO/AddMessagePropsDTO";
import { MessagePropsDTO } from "@/src/persistence/MMKVStorage/DTO/MessagePropsDTO";
import { MMKVChats } from "@/src/persistence/MMKVStorage/MMKVChats";
import { router, useFocusEffect } from "expo-router";
import { Channel, Socket } from "phoenix";
import { useCallback, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

type ModalDescriptionProps = {
    nickname: string;
    description: string;
    tag_user_id: string;
    photo_url: string;
}

type MessageWasSendProps = {
    chat_id: string;
    status: string;
    message_id: string;
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
    const [userId] = useState<string>(user_id as string);
    const [mmkvStorage] = useState(new MMKVChats());
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

    function handleReceiverMessage(messageFromServer: AddMessagePropsDTO){
        const who = messageFromServer.sender_id === user_id ? "user" : "contact";

        const newMessage = mmkvStorage.addMessage({
            ...messageFromServer,
            sender_id: who,
            timestamp: new Date().toISOString(),
        }) as MessagePropsDTO;

        setMessages((prevMessages) => [newMessage, ...prevMessages]);
    }

    function handleVerifyIfMessageWasSend({ chat_id, status, message_id }: MessageWasSendProps){
        mmkvStorage.updateMessageStatus({
            chat_id,
            id_message: message_id,
            status: status,
        });
    }

    function handleVerificationIfOtherSideIsTyping({is_typing}: any) {
        setIsUserTyping(is_typing);
    };

    function handleTrackIfOtherSideIsOnline({ status }: { status: boolean }) {
        setIsReceiverOnline(status);
    }

    function handleRecoverOtherSideInformation({description, nickname, photo_url, preferred_language, tag_user_id}: OtherSideChatInformationProps){
        setModalDescriptionProps({description, nickname, photo_url, tag_user_id});
        mmkvStorage.updateChatInformationProfile({description, nickname, photo_url, preferred_language}, chat_id as string);
    }
    // handle local states
    function handleGetOlderMessages(chat_id: string, offset: number){
        const chat = mmkvStorage.getChat(chat_id);
        if (!chat || !chat.searched_chats) return [];
        if (offset >= chat.searched_chats.messages.length) return [];
        if (chat.searched_chats.messages.length <= 20) return [];

        const oldMessages = chat.searched_chats.messages.slice(offset, offset + 20).reverse();
        if (oldMessages.length > 0) {
            setMessages((prevMessages) => [...prevMessages, ...oldMessages]);
        }
    }

    function handleWriteMessage(message: string) {
        handleTypingTrack(true);
        setInputMessage(message);
        if (message.length === 0) handleTypingTrack(false);
    }

    function handleSendMessage() {
        if (inputMessage.trim()) {;
          const newMessage = mmkvStorage.addMessage({
            chat_id: chat_id as string,
            content: inputMessage,
            sender_id: userId,
            timestamp: new Date().toISOString(),
          }) as MessagePropsDTO;

          channel?.push("send_message", { mobile_ref_id: newMessage.id_message, content: inputMessage });
    
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
        router.back();
    }
    // Load chat messages and divide into chunks
    useEffect(() => {
        const response = mmkvStorage.getChat(chat_id as string);
    
        if (!response) return;
        if (!response.searched_chats) {
            Alert.alert("Chat not found");
            router.back();
            return;
        }

        let profilePhoto = response.searched_chats.profile_picture;
        if(profilePhoto != "https://static.vecteezy.com/system/resources/previews/020/765/399/non_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"){
            profilePhoto = "http://localhost:3006" + profilePhoto
        }

        mmkvStorage.clearNotifications(chat_id as string);
        setProfilePicture(profilePhoto);
            // Ordena as mensagens por timestamp
            const sortedMessages = response.searched_chats.messages.sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    
        setMessages(sortedMessages);
    }, [chat_id, mmkvStorage]);

    // Event listeners
    useFocusEffect(
        useCallback(() => {
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
        }, [chat_id, socket, user_id])
    );

    const values = {
        isUserTyping,
        channel,
        messages,
        inputMessage,
        profilePicture,
        isReceiverOnline,
        userId,
        isModalDescriptionOpen,
        modalDescriptionProps,
        handleCloseChat,
        handleGetOlderMessages,
        handleWriteMessage,
        handleSendMessage,
        handleTypingTrack,
        handleOpenAndCloseModalDescription
    }

    return values;
}