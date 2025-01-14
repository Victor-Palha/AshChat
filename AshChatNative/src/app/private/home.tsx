import { ChatList } from "@/src/components/ChatList";
import { Footer } from "@/src/components/Footer";
import { ModalAdd } from "@/src/components/ModalAdd";
import { NoContacts } from "@/src/components/NoContacts";
import { LabelChatPropsDTO } from "@/src/persistence/MMKVStorage/DTO/LabelChatPropsDTO";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {useEffect, useState } from "react";
import { Text, TouchableOpacity, View} from "react-native";
import { useMMKVObject } from "react-native-mmkv";

export default function Home(){
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chatLabels] = useMMKVObject<LabelChatPropsDTO[]>("ashchat.label.chats")
    const [typeOfLabelToShow, setTypeOfLabelToShow] = useState("all");
    const [chatLabelsToShow, setChatLabelsToShow] = useState<LabelChatPropsDTO[] | undefined>(undefined);

    function handleOpenModal() {
        setIsModalOpen(!isModalOpen);
    }
    function filterChatsToShow(type: string) {
        if (!chatLabels) return;
        const filteredChats = type === "all" ? chatLabels : chatLabels.filter(chat => chat.notification > 0);
        setChatLabelsToShow(filteredChats);
    }
    useEffect(() => {
        filterChatsToShow(typeOfLabelToShow);
    }, [chatLabels, typeOfLabelToShow]);
    
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
                <TouchableOpacity className="flex-row items-center gap-2" onPress={() => setTypeOfLabelToShow("all")}>
                    <Ionicons name="chatbubble-outline" size={24} color="white" />
                    <Text className={`font-bold ${typeOfLabelToShow === "all" ? "text-purple-700" : "text-white"}`}>
                        All
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-row items-center gap-2" onPress={() => setTypeOfLabelToShow("unread")}>
                    <Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />
                    <Text className={`font-bold ${typeOfLabelToShow === "unread" ? "text-purple-700" : "text-white"}`}>
                        Unread
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Body */}
            {chatLabelsToShow ? (
                <ChatList
                    chatLabels={chatLabelsToShow}
                />
            ) :
                <NoContacts/>
            }

            {/* Modal */}
            <ModalAdd modalIsOpen={isModalOpen} closeModal={handleOpenModal}/>
            {/* Footer */}
            <Footer activeTab="home"/>
        </View>
    )
}