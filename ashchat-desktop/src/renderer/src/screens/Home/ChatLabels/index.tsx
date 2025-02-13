import { LabelChatPropsDTO } from "../../../../../main/persistence/DTO/LabelChatPropsDTO"

type LabelChatProps = {
    chats: LabelChatPropsDTO[]
    handleSelectChat: (chat: string) => void
}
export function ChatLabels(data: LabelChatProps){
    return (
        <aside className="p-5 flex flex-col gap-4 h-screen w-full bg-gray-700">
            <div className="flex gap-4 items-center border-b-[1px] border-purple-700 p-5">
                <img src="http://localhost:3006/files/04a76336-3571-4680-a55a-ad6ee5dfff62.jpg" className="rounded-full w-[70px] h-[70px]"/>
                <h1 className="font-kenia text-4xl">Chats</h1>
            </div>
            <nav>
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
            </nav>
        </aside>
    )
}