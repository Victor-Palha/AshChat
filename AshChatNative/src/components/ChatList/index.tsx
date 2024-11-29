import { LabelChatProps } from "@/src/persistence/MMKVStorage";
import { Link } from "expo-router";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

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
                <Link
                className="flex flex-row items-center gap-4 p-4 border-b border-gray-800"
                asChild
                href={{
                    pathname: "/private/chat",
                    params: {
                    chat_id: item.chat_id,
                    nickname: item.nickname,
                    },
                }}
                >
                    <TouchableOpacity className="flex flex-1 flex-row justify-between items-center">
                        <View>
                        <Text className="text-white font-bold text-base">{item.nickname}</Text>
                        <Text className="text-gray-400 text-sm">
                            {item.last_message ? item.last_message.content : ""}
                        </Text>
                        </View>
                        {item.notification >= 1 && (
                        <View className="bg-purple-700 w-8 h-8 rounded-full justify-center items-center">
                            <Text className="text-white text-xs font-semibold">
                            {item.notification}
                            </Text>
                        </View>
                        )}
                    </TouchableOpacity>
                </Link>
            )}
        />
    )
}