import { useState } from "react";
import { ChatLabels } from "./ChatLabels";
import { HomeViewModel } from "./home-view-model";
import { NoContacts } from "./NoContacts";
import { SideBar } from "./SideBar";
import { useValidate } from "../../hooks/useValidate";
import { Chat } from "./Chat";

type ChatLabelsProps = {
    id: string;
    nickname: string;
    photo_url: string;
}
export function Home(){
    useValidate
    const {
        userProfile,
        chatLabelsToShow,
        isModalOpen,
        typeOfLabelToShow,
        handleSetTypeOfLabelToShow
        
    } = HomeViewModel();
    const [chatSelected, setChatSelected] = useState<ChatLabelsProps | null>(null);
    // console.log(chatLabelsToShow)

    function handleSelectChat(chat: string){
        const nickname = chatLabelsToShow?.find((chatSelected) => chatSelected.chat_id === chat)?.nickname || "";
        const photo_url = chatLabelsToShow?.find((chatSelected) => chatSelected.chat_id === chat)?.profile_picture || "";
        setChatSelected({
            id: chat,
            nickname: nickname || "",
            photo_url: photo_url || ""
        });
    }
    return (
        <div>
            {/* ChatLabels */}
            <main className="grid grid-cols-[8%_30%_62%] lg:grid-cols-[7%_30%_63%] xl:grid-cols-[6%_30%_64%] h-screen">
                <SideBar
                    userPhotoProfile={userProfile?.photo_url}
                />
                {chatLabelsToShow && (
                    <ChatLabels
                        chats={chatLabelsToShow}
                        handleSelectChat={handleSelectChat}
                        handleSetTypeOfLabelToShow={handleSetTypeOfLabelToShow}
                        typeOfLabelToShow={typeOfLabelToShow}
                    />
                )}

                {/* Chat */}
                {chatSelected ? (
                    <Chat
                        chat_id={chatSelected.id}
                        nickname={chatSelected.nickname}
                    />
                ) : (
                    <NoContacts/>
                )}
            </main>
        </div>   
    )
}