import { useState } from "react";
import { ChatLabels } from "./ChatLabels";
import { HomeViewModel } from "./home-view-model";
import { NoContacts } from "./NoContacts";
import { SideBar } from "./SideBar";

export function Home(){
    const {
        chatLabelsToShow,
        isModalOpen,
        typeOfLabelToShow,
        handleOpenModal,
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
                <SideBar handleOpenModal={handleOpenModal} />
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
                        <button onClick={handleOpenModal}>Add Contact</button>
                    </div>
                ) : (
                    <NoContacts/>
                )}
            </main>
        </div>   
    )
}