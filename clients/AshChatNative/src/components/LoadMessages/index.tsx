import { MessagePropsDTO } from "@/src/persistence/MMKVStorage/DTO/MessagePropsDTO";
import { getHoursFromDate } from "@/src/utils/getHoursFromDate";
import { Text, View } from "react-native";

type LoadMessagesProps = {
    item: MessagePropsDTO;
    user_id: string;
    lastMessageDate?: string;
};

function normalizeDate(timestamp: number | string | Date): string {
    const date = new Date(timestamp);
    date.setHours(0, 0, 0, 0);
    return date.toLocaleDateString();
}

export function LoadMessages({ item, user_id, lastMessageDate }: LoadMessagesProps): JSX.Element {
    const isCurrentUser = item.sender_id === user_id;
    const messageDate = normalizeDate(item.timestamp);
    const today = normalizeDate(new Date());

    const shouldShowDate = messageDate !== lastMessageDate;

    return (
        <View>
            {shouldShowDate && (
                <View className="py-2">
                    <Text className="text-gray-400 text-center font-bold text-lg">
                        {messageDate === today ? "Today" : messageDate}
                    </Text>
                </View>
            )}

            {/* Message Bubble */}
            <View
                className={`my-2 p-3 rounded-xl max-w-[80%] ${
                    isCurrentUser ? "bg-purple-700 self-end" : "bg-gray-950 self-start"
                }`}
            >
                <Text className="text-white">{item.content}</Text>
            </View>

            {/* Time and Status */}
            <View
                className={`flex-row items-center ${
                    isCurrentUser ? "justify-end" : "justify-start"
                }`}
            >
                <Text className="text-gray-400 text-sm">
                    {getHoursFromDate(item.timestamp)}
                </Text>

                {isCurrentUser && (
                    <Text className="text-gray-400 text-sm ml-2">
                        {item.status === "sent" ? "Sent" : "Delivered"}
                    </Text>
                )}
            </View>
        </View>
    );
}
