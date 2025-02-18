import { Alert, Keyboard, Text, TouchableWithoutFeedback, View } from "react-native";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useContext, useState } from "react";
import { AuthContext } from "../contexts/auth/authContext";

export default function ForgotPassword(){
    const [email, setEmail] = useState("");
    const {onForgotPassword} = useContext(AuthContext)
    async function handleSendCodeToEmail(){
        if (email.length < 3){
            return Alert.alert("Please enter a valid email address");
        }
        await onForgotPassword(email);
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 pt-[62px] items-center justify-center">
            <View className="items-center justify-center px-[45] mb-10">
                <Text className="text-white font-bold text-lg mb-5">Forgot your password?</Text>
                <Text className="text-white italic">We’ll send a code to your email address to recover your account.</Text>
            </View>

            <View className="flex-row justify-between px-5 gap-2 mb-10">
                <Input
                    icon="mail"
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />
            </View>
            <Button title="Send code" onPress={handleSendCodeToEmail}/>
        </View>
        </TouchableWithoutFeedback>
    )
}