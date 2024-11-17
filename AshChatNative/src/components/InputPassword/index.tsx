import { TextInput, TextInputProps, TouchableOpacity, View } from "react-native"
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { useState } from "react";

type InputProps = TextInputProps & {
}
export function InputPassword({ ...rest }: InputProps){
    const [isPassVisible, setIsPassVisible] = useState(true);
    const [iconPass, setIconPass] = useState<"eye-off" | "eye">("eye-off");
    function handleShowPassword(){
        setIsPassVisible(!isPassVisible);
        if(isPassVisible){
            setIconPass("eye");
        }else{
            setIconPass("eye-off");
        }
    }
    return (
        <View className="bg-white w-[290] rounded-lg flex-row items-center px-2">
            <MaterialIcons name="lock" size={24} color="black" />
            <TextInput
                className="w-[210] max-w-[210] opacity-75 p-4 placeholder:text-gray-700"
                // secureTextEntry={isPassVisible}
                {...rest}
            />
            <TouchableOpacity onPress={handleShowPassword}>
                <Feather name={iconPass} size={20} color="black" />
            </TouchableOpacity>
        </View>
    )
}