import { ModalAdd } from "@/src/components/ModalAdd";
import { NoContacts } from "@/src/components/NoContacts";
import { LabelChatProps } from "@/src/persistence/MMKVStorage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View, Image, FlatList } from "react-native";
import { useMMKVObject } from "react-native-mmkv";

export default function Home(){
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chatLabels] = useMMKVObject<LabelChatProps[]>("ashchat.label.chats")

    function handleOpenModal() {
        setIsModalOpen(!isModalOpen);
    }
    
    return (
        <View className="flex-1 pt-[62px] px-10" >
            {/* Header */}
            <View className="items-end py-5">
                <TouchableOpacity className="bg-purple-700 rounded-full p-1" onPress={handleOpenModal}>
                    <MaterialIcons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>
            {/* Nav */}
            <Text className="font-bold text-white text-3xl">My Chats</Text>

            <View className="flex-row items-center justify-between mt-5">
                <TouchableOpacity className="flex-row items-center gap-2">
                    <Ionicons name="chatbubble-outline" size={24} color="white" />
                    <Text className="text-white font-bold">All</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-row items-center gap-2">
                    <Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />
                    <Text className="text-white font-bold">Unread</Text>
                </TouchableOpacity>
            </View>
            {/* Body */}
            {chatLabels ? (
                <FlatList
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
            ) :
                <NoContacts/>
            }

            {/* Modal */}
            <ModalAdd modalIsOpen={isModalOpen} closeModal={handleOpenModal}/>
        </View>
    )
}