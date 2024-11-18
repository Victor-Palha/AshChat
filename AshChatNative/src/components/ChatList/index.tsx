import { LabelChatProps } from "@/src/persistence/MMKVStorage";
import { Link } from "expo-router";
import { FlatList, Text, TouchableOpacity } from "react-native";

type ChatListProps = {
    chatLabels: LabelChatProps[]
}
export function ChatList({chatLabels}: ChatListProps){
    return (
        <FlatList
            className="mt-5"
            data={chatLabels}
            keyExtractor={item => item.chat_id}
            renderItem={({item}) => (
                <Link className="flex-row items-center gap-5 p-3 border-b border-gray-800" asChild href={{
                    pathname: "/private/chat",
                    params: {
                        chat_id: item.chat_id,
                        nickname: item.nickname,
                    }
                }}>
                    <TouchableOpacity>
                            <Text className="text-white font-bold">{item.nickname}</Text>
                            <Text className="text-white">{item.last_message ? item.last_message.content : ""}</Text>
                    </TouchableOpacity>
                </Link>
            )}
        />
    )
}