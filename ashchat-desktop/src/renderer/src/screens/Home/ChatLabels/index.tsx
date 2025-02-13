import { ChatCircle, ChatCircleSlash } from "@phosphor-icons/react"
import { LabelChatPropsDTO } from "../../../../../main/persistence/DTO/LabelChatPropsDTO"

type LabelChatProps = {
    chats: LabelChatPropsDTO[]
    typeOfLabelToShow: string
    handleSelectChat: (chat: string) => void
    handleSetTypeOfLabelToShow: (type: "all" | "unread") => void
}
export function ChatLabels(data: LabelChatProps){
    return (
        <nav className="p-5 flex flex-col gap-4 h-screen w-full bg-gray-700">
            {/* Options */}
            <div className="flex gap-4 items-center border-b-[1px] border-purple-700 p-5">
                <h1 className="font-kenia text-4xl">Chats</h1>
            </div>
            {/* Select type of chat to show */}
            <div className="flex flex-row items-center justify-between mt-5">
                <button className="flex flex-row items-center gap-2" onClick={() => data.handleSetTypeOfLabelToShow("all")}>
                    <ChatCircle size={22} color="white" />
                    <span className={`font-bold ${data.typeOfLabelToShow === "all" ? "text-purple-700" : "text-white"}`}>
                        All
                    </span>
                </button>
                <button className="flex flex-row items-center gap-2" onClick={() => data.handleSetTypeOfLabelToShow("unread")}>
                    <ChatCircleSlash name="chatbubble-ellipses-outline" size={22} color="white" />
                    <span className={`font-bold ${data.typeOfLabelToShow === "unread" ? "text-purple-700" : "text-white"}`}>
                        Unread
                    </span>
                </button>
            </div>
            {/* Chat labels */}
            <>
                {data.chats.map((chat) => (
                    <button onClick={() => data.handleSelectChat(chat.chat_id)} key={chat.chat_id} className="flex gap-4">
                        <img src={chat.profile_picture} alt={chat.nickname+" photo"} />
                        <div className="flex flex-col gap-4">
                            <h1>{chat.nickname}</h1>
                            <p>{chat?.last_message?.content}</p>
                        </div>
                        <span>{chat.last_interaction.getTime()}</span>
                    </button>
                ))}
            </>
        </nav>
    )
}