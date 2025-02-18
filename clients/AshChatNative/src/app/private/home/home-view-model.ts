import { LabelChatPropsDTO } from "@/src/persistence/MMKVStorage/DTO/LabelChatPropsDTO";
import { useEffect, useState } from "react";
import { useMMKVObject } from "react-native-mmkv";

export function HomeViewModel(){
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chatLabels] = useMMKVObject<LabelChatPropsDTO[]>("ashchat.label.chats")
    const [typeOfLabelToShow, setTypeOfLabelToShow] = useState("all");
    const [chatLabelsToShow, setChatLabelsToShow] = useState<LabelChatPropsDTO[] | undefined>(undefined);

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

    useEffect(() => {
        filterChatsToShow(typeOfLabelToShow);
    }, [chatLabels, typeOfLabelToShow]);

    return {
        isModalOpen,
        chatLabelsToShow,
        typeOfLabelToShow,
        handleOpenModal,
        filterChatsToShow,
        handleSetTypeOfLabelToShow
    }
}