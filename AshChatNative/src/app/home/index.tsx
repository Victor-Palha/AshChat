import { ModalAdd } from "@/src/components/ModalAdd";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View, Image } from "react-native";

export default function Home(){
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            <View className="items-center justify-center pt-[30%]">
                <Image
                    className="rounded-full w-100 h-100"
                    source={require('../../assets/nowhere.png')}
                />
                <Text className="text-white font-semibold italic text-md mt-[-40] text-center">Hmm... You seen to be lost! Try to connect to someone!</Text>
            </View>
            <ModalAdd modalIsOpen={isModalOpen} closeModal={handleOpenModal}/>
        </View>
    )
}