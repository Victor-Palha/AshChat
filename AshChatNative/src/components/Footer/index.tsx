import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";

type activeTab = "home" | "settings"
export function Footer({activeTab}: {activeTab: activeTab}) {
    return (
        <View className="bg-gray-900 h-28 w-screen items-center absolute bottom-0 flex-row justify-between px-20 border-t-2 border-purple-700">
            <TouchableOpacity>
                <Ionicons name="home-outline" size={24} color={activeTab == "home" ? "#8075FF" : "white"} />
            </TouchableOpacity>
            <TouchableOpacity>
                <Ionicons name="settings-outline" size={24} color={activeTab == "settings" ? "#8075FF" : "white"} />
            </TouchableOpacity>
        </View>
    )
}