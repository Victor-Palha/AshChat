import { ActivityIndicator, View } from "react-native";

export function Loading(){
    return (
        <View className="flex flex-1 items-center justify-center bg-gray-700">
            <ActivityIndicator size="large" className="text-brand-light"/>
        </View>
    )
}