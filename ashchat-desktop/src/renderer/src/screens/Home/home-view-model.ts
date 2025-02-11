import { LabelChatPropsDTO } from "../../../../main/persistence/DTO/LabelChatPropsDTO";
import { useEffect, useState } from "react";

export function HomeViewModel(){
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chatLabels, setChatLabels] = useState<LabelChatPropsDTO[]>([]);
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

    async function getAllLabels() {
        const chats = await window.labelApi.getLabels();
        if(chats){
            setChatLabels(chats);
            return;
        }
        setChatLabels([]);
    }

    useEffect(()=>{
        getAllLabels();
    }, [])

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