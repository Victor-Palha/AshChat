import { MessageProps } from "@/src/persistence/MMKVStorage";
import { getHoursFromDate } from "@/src/utils/getHoursFromDate";
import { Text, View } from "react-native";

type LoadMessagesProps = {
    item: MessageProps;
    user_id: string;
}
export function LoadMessages({ item, user_id }: LoadMessagesProps): JSX.Element {
    const isCurrentUser = item.sender_id === user_id;
    return (
        <View>
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