import { Button } from "@/src/components/Button";
import { router } from "expo-router";
import { Image, Text, View } from "react-native";
import { Gradient } from "@/src/components/Grandient";
import { useValidate } from "@/src/hooks/useValidate";
import SecureStoragePersistence from "../persistence/SecureStorage";
import { MMKVStorage } from "../persistence/MMKVStorage";

// const MMKV = new MMKVStorage()
// const safeStorage = SecureStoragePersistence

export default function Index(){
    useValidate()
    function handleStart(){
        router.navigate("/login");
    }
    return (
        <View   
            className="flex-1 pt-[62px] items-center justify-center text-white"
        >   
        <Gradient/>
            <View className="items-center justify-center mb-[25]">
                <Image source={require("../assets/logo.png")}/>
                <Text className="text-5xl text-white" style={{fontFamily: "Kenia_400Regular"}}>AshChat</Text>
            </View>
            <View className="justify-center items-center text-center gap-5">
                <Text className="text-white font-bold">Welcome to AshChat!</Text>
                <Text className="text-white text-center">A real-time chat app powered by AI to facilitate communication around the world!</Text>
            </View>
            <View className="mt-[150]">
                <Button title="Get Started" onPress={handleStart}/>
            </View>
        </View>
    )
}