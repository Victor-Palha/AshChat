import { Footer } from "@/src/components/Footer";
import { View } from "react-native";

export default function Settings(){
    return (
        <View className="flex-1 pt-[62px] px-10">
            <Footer activeTab="settings"/>
        </View>
    )
}