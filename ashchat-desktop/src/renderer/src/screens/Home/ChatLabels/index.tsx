import { LabelChatPropsDTO } from "../../../../../main/persistence/DTO/LabelChatPropsDTO"


export function ChatLabels(chat: LabelChatPropsDTO){
    return (
        <article className="flex items-center justify-around gap-4">
            <img src={chat.profile_picture} alt={chat.nickname+" photo"} />
            <div className="flex flex-col gap-4">
                <h1>{chat.nickname}</h1>
                <p>{chat?.last_message?.content}</p>
            </div>
            <span>{chat.last_interaction.getTime()}</span>
        </article>
    )
}