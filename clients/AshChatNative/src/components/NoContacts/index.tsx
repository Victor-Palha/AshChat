import { Image, Text, View } from "react-native";

export function NoContacts(){
    return (
        <View className="items-center justify-center pt-[30%]">
            <Image
                className="rounded-full w-100 h-100"
                source={require('../../assets/nowhere.png')}
            />
            <Text className="text-white font-semibold italic text-md mt-[-40] text-center">Hmm... You seen to be lost! Try to connect to someone!</Text>
        </View>
    )
}