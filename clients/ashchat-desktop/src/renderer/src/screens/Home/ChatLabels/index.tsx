import { ChatCircle, ChatCircleSlash } from "@phosphor-icons/react"
import { LabelChatPropsDTO } from "../../../../../main/persistence/DTO/LabelChatPropsDTO"
import { formatTimeOrDate } from "../../../lib/getDateAndTimeFromDate"

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
            <div className="flex flex-col gap-2">
                {data.chats.map((chat) => (
                    <button
                        onClick={() => data.handleSelectChat(chat.chat_id)}
                        key={chat.chat_id}
                        className="flex gap-4 cursor-pointer border-b-[0.5px] border-gray-800 p-2 w-full"
                    >
                        {/* Profile picture */}
                        <img
                            className="w-10 h-10 rounded-full flex-shrink-0"
                            src={chat.profile_picture}
                            alt={chat.nickname + " photo"}
                        />

                        {/* Chat details */}
                        <div className="flex-1 min-w-0">
                            {/* Nickname and last interaction time */}
                            <div className="flex justify-between items-center">
                                <p className="truncate">{chat.nickname}</p>
                                <span className="text-xs italic flex-shrink-0 pl-2">
                                    {chat.last_interaction && formatTimeOrDate(chat.last_interaction.toISOString())}
                                </span>
                            </div>

                            {/* Last message and notification */}
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-sm text-gray-400 truncate">
                                    {chat?.last_message?.content}
                                </span>
                                {chat.notification >= 1 && (
                                    <div className="bg-purple-700 w-5 h-5 rounded-full flex justify-center items-center flex-shrink-0 ml-2">
                                        <span className="text-white text-[12px] font-semibold">
                                            {chat.notification}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </nav>
    )
}