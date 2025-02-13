import { useState } from "react";
import { ChatLabels } from "./ChatLabels";
import { HomeViewModel } from "./home-view-model";
import { NoContacts } from "./NoContacts";

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
            <main className="grid grid-cols-[35%_65%]">
                {chatLabelsToShow && (
                    <ChatLabels
                        chats={chatLabelsToShow}
                        handleSelectChat={handleSelectChat}
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