import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

type ButtonProps = TouchableOpacityProps & {
    title: string;
}
export function Button({title, ...rest}: ButtonProps){
    return (
        <TouchableOpacity className="bg-purple-700 py-[15] w-[290] rounded-md items-center shadow-lg" {...rest}>
            <Text className="text-white font-bold">{title}</Text>
        </TouchableOpacity>
    )

}