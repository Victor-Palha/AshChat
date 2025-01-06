import { LabelChatPropsDTO } from "@/src/persistence/MMKVStorage/DTO/LabelChatPropsDTO";
import { formatTimeOrDate } from "@/src/utils/getDateAndTimeFromDate";
import { Link } from "expo-router";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

type ChatListProps = {
    chatLabels: LabelChatPropsDTO[]
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
                        profile_picture: item.profile_picture,
                    },
                }}
                >
                    <TouchableOpacity className="flex flex-1 flex-row justify-between items-center">
                        <View>
                            <View className="flex flex-row items-center gap-4">                               
                                <Image source={{ uri: item.profile_picture }} className="w-12 h-12 rounded-full" />
                                <Text className="text-white font-bold text-base">{item.nickname}</Text>
                            </View>
                            <Text className="text-gray-400 text-sm mt-2 max-w-[95%] max-h-10">
                                {item.last_message ? item.last_message.content : ""}
                            </Text>
                        </View>
                        <View className="gap-2">
                            <Text className="text-gray-400 text-sm">
                                {item.last_interaction ? formatTimeOrDate(item.last_interaction as any) : ""}
                            </Text>
                            {item.notification >= 1 && (
                            <View className="bg-purple-700 w-8 h-8 rounded-full justify-center items-center">
                                <Text className="text-white text-xs font-semibold">
                                {item.notification}
                                </Text>
                            </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </Link>
            )}
        />
    )
}