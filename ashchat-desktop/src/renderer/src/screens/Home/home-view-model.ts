import { User } from "@prisma/client";
import { LabelChatPropsDTO } from "../../../../main/persistence/DTO/LabelChatPropsDTO";
import { useEffect, useState } from "react";
import { MessagePropsDTO } from "main/persistence/DTO/MessagePropsDTO";
import { ipcRenderer } from "electron";
export function HomeViewModel(){
    const [notifications, setNotifications] = useState<MessagePropsDTO | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chatLabels, setChatLabels] = useState<LabelChatPropsDTO[]>([]);
    const [typeOfLabelToShow, setTypeOfLabelToShow] = useState("all");
    const [chatLabelsToShow, setChatLabelsToShow] = useState<LabelChatPropsDTO[] | undefined>(undefined);
    const [userProfile, setUserProfile] = useState<User | null>(null);

    function handleOpenModal() {
        setIsModalOpen(!isModalOpen);
    }
    
    function filterChatsToShow(type: string) {
        if (!chatLabels) return;
        const filteredChats = type === "all" ? chatLabels : chatLabels.filter(chat => chat.notification > 0);
        setChatLabelsToShow(filteredChats);
    }

    function handleSetTypeOfLabelToShow(type: "all" | "unread") {
        setTypeOfLabelToShow(type);
    }

    async function getAllLabels() {
        const chats = await window.labelApi.getLabels();
        if(chats){
            setChatLabels(chats);
            return;
        }
        setChatLabels([]);
    }

    async function getUserProfile() {
        const user = await window.userApi.getUser();
        if(user){
            setUserProfile(user);
            return;
        }
        setUserProfile(null);
    }

    useEffect(()=>{  
        window.chatApi.onNewMessage((message: MessagePropsDTO) => {
            setNotifications(message);
        })

        getUserProfile();
        getAllLabels();
    }, [notifications])

    useEffect(() => {
        filterChatsToShow(typeOfLabelToShow);
    }, [chatLabels, typeOfLabelToShow]);

    return {
        userProfile,
        isModalOpen,
        chatLabelsToShow,
        typeOfLabelToShow,
        handleOpenModal,
        filterChatsToShow,
        handleSetTypeOfLabelToShow
    }
}