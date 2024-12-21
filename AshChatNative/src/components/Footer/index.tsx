import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { TouchableOpacity, View } from "react-native";

type activeTab = "home" | "settings"
export function Footer({activeTab}: {activeTab: activeTab}) {
    function handleBack(){
        if(activeTab == "home"){
            return;
        }
        router.back();
    }
    return (
        <View className="bg-gray-900 h-28 w-screen items-center absolute bottom-0 flex-row justify-between px-20 border-t-2 border-purple-700">
            <TouchableOpacity onPress={handleBack}>
                <Ionicons name="home-outline" size={24} color={activeTab == "home" ? "#8075FF" : "white"} />
            </TouchableOpacity>
            <Link push href="/private/settings" asChild>
                <TouchableOpacity>
                    <Ionicons name="settings-outline" size={24} color={activeTab == "settings" ? "#8075FF" : "white"} />
                </TouchableOpacity>
            </Link>
        </View>
    )
}