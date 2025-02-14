import { getHoursFromDate } from "../../../../lib/getHoursFromDate";
import { MessagePropsDTO } from "../../../../../../main/persistence/DTO/MessagePropsDTO";
import LocalStoragePersistence from "../../../../lib/local-storage-persistence";

interface LoadMessagesProps {
    item: MessagePropsDTO;
    lastMessageDate?: string;
}

function normalizeDate(timestamp: number | string | Date): string {
    const date = new Date(timestamp);
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
}

export function LoadMessages({ item, lastMessageDate }: LoadMessagesProps): JSX.Element {
    const user_id = LocalStoragePersistence.getUserId() as string;
    const isCurrentUser = item.sender_id === user_id;
    const messageDate = normalizeDate(item.timestamp);
    const today = normalizeDate(new Date());

    const isFirstMessageOfDay = lastMessageDate !== messageDate;
    return (
        <div>
            {/* Exibe a data apenas se for a primeira mensagem do dia */}
            {isFirstMessageOfDay && (
                <div className="py-2">
                    <p className="text-gray-400 text-center font-bold text-lg">
                        {messageDate === today ? "Today" : new Date(messageDate).toLocaleDateString()}
                    </p>
                </div>
            )}

            {/* Message Bubble */}
            <div
                className={`flex my-2 p-3 rounded-xl max-w-[80%] ${
                    isCurrentUser ? "bg-purple-700 ml-auto" : "bg-gray-950"
                }`}
                style={{ width: "fit-content" }}
            >
                <p className="text-white break-words">{item.content}</p>
            </div>

            {/* Time and Status */}
            <div className={`flex items-center ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                <p className="text-gray-400 text-sm">{getHoursFromDate(item.timestamp.toISOString())}</p>
                {isCurrentUser && (
                    <p className="text-gray-400 text-sm ml-2">
                        {item.status === "sent" ? "Sent" : "Delivered"}
                    </p>
                )}
            </div>
        </div>
    );
}