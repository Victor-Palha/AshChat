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
    console.log(chatLabelsToShow)
    return (
        <main className="flex flex-1 px-10" >
            <h1>CHATS</h1>
            {/* ChatLabels */}
            {chatLabelsToShow && chatLabelsToShow?.length > 0 ? (
                <div>
                    {chatLabelsToShow.map((chat) => (
                        <ChatLabels
                            chat_id={chat.chat_id}
                            profile_picture={chat.profile_picture}
                            nickname={chat.nickname}
                            notification={chat.notification}
                            last_message={chat.last_message}
                            last_interaction={chat.last_interaction}
                            key={chat.chat_id}
                        />
                    ))}
                </div>
            ) :
                <NoContacts/>
            }
        </main>   
    )
}