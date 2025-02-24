import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';
type ButtonProps = TouchableOpacityProps & {
    title: string;
    isLoading?: boolean
}
export function Button({title, isLoading = false, ...rest}: ButtonProps){
    return (
        <TouchableOpacity 
            className="bg-purple-700 py-[15] w-[290] rounded-md items-center shadow-lg"
            disabled={isLoading}
            {...rest}
        >
            {isLoading ? (
                    <AntDesign name="loading1" size={20} className="animate-spin mx-auto"/>
            ) : (
                <Text className="text-white font-bold">{title}</Text>
            )}
        </TouchableOpacity>
    )

}