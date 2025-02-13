import { useState } from "react";
import { ChatLabels } from "./ChatLabels";
import { HomeViewModel } from "./home-view-model";
import { NoContacts } from "./NoContacts";
import { SideBar } from "./SideBar";
import { useValidate } from "../../hooks/useValidate";

export function Home(){
    useValidate
    const {
        userProfile,
        chatLabelsToShow,
        isModalOpen,
        typeOfLabelToShow,
        handleSetTypeOfLabelToShow
        
    } = HomeViewModel();
    const [chatSelected, setChatSelected] = useState<string | null>(null);
    console.log(chatLabelsToShow)

    function handleSelectChat(chat: string){
        setChatSelected(chat);
    }
    return (
        <div>
            {/* ChatLabels */}
            <main className="grid grid-cols-[10%_35%_55%] lg:grid-cols-[8%_25%_66%]">
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
                    <div className="flex flex-1 flex-col gap-4">
                        <h1>{chatSelected}</h1>
                        <button onClick={()=>{}}>Add Contact</button>
                    </div>
                ) : (
                    <NoContacts/>
                )}
            </main>
        </div>   
    )
}