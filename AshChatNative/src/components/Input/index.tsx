import { TextInput, TextInputProps, TouchableOpacity, View } from "react-native"
import { MaterialIcons } from "@expo/vector-icons";

type InputProps = TextInputProps & {
    icon: keyof typeof MaterialIcons["glyphMap"]
}
export function Input({icon, ...rest }: InputProps){
    return (
        <View className="bg-white w-[290] rounded-lg flex-row items-center px-2">
            <MaterialIcons name={icon} size={24} color="black" />
            <TextInput
                className="w-[250] max-w-[250] opacity-75 p-4 placeholder:text-gray-700"
                {...rest}
            />
        </View>
    )
}