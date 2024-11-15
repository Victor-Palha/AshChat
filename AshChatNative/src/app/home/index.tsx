import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export default function Home(){
    return (
        <View className="flex-1 pt-[62px] items-center justify-center text-white px-10" >
            {/* Header */}
            <View className="justify-end items-center py-5">
                <TouchableOpacity className="bg-purple-700 rounded-full">
                    <MaterialIcons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <Text className="font-bold text-white text-3xl">My Chats</Text>

            <View className="flex-row items-center justify-around">
                <TouchableOpacity className="flex-row items-center gap-2">
                    <Ionicons name="chatbubble-outline" size={24} color="white" />
                    <Text>All</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-row items-center gap-2">
                    <Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />
                    <Text>Unread</Text>
                </TouchableOpacity>
            </View>
            
        </View>
    )
}