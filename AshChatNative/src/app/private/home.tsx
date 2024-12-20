import { PhoenixAPIClient } from "@/src/api/phoenix-api-client";
import { ChatList } from "@/src/components/ChatList";
import { Footer } from "@/src/components/Footer";
import { ModalAdd } from "@/src/components/ModalAdd";
import { NoContacts } from "@/src/components/NoContacts";
import { LabelChatProps, MMKVStorage } from "@/src/persistence/MMKVStorage";
import SecureStoragePersistence from "@/src/persistence/SecureStorage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View} from "react-native";
import { useMMKVObject } from "react-native-mmkv";

export default function Home(){
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chatLabels] = useMMKVObject<LabelChatProps[]>("ashchat.label.chats")

    function handleOpenModal() {
        setIsModalOpen(!isModalOpen);
    }

    async function setUserProfile() {
        const api = PhoenixAPIClient
        const mmkvStorage = new MMKVStorage()
        const token = await SecureStoragePersistence.getJWT()
        const device_token = await SecureStoragePersistence.getUniqueDeviceId()
        if(!token || !device_token) return
        api.setTokenAuth(token)
        api.setHeader("device_token", device_token)
        try {
            const response = await api.server.get("/user")
            if(response.status == 200){
                const {nickname, description, photo_url, preferred_language, tag_user_id} = response.data.user
                mmkvStorage.setUserProfile({
                    nickname,
                    description,
                    photo_url,
                    preferred_language,
                    tag_user_id
                })
            }
        } catch (error) {
            console.log(error)
        }
    }

    setUserProfile()
    
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
                <ChatList
                    chatLabels={chatLabels}
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