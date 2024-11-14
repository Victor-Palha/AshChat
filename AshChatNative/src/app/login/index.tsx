import { Button } from "@/src/components/Button";
import { Gradient } from "@/src/components/Grandient";
import { Input } from "@/src/components/Input";
import { InputPassword } from "@/src/components/InputPassword";
import { Image, Keyboard, KeyboardAvoidingView, Platform, Text, TouchableWithoutFeedback, View } from "react-native";

export default function Login(){
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
            className="flex-1 pt-[62px] items-center justify-center text-white"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} 
        >
            <Gradient/>
            <View className="items-center justify-center mb-[25]">
                <Image source={require("../../assets/logo.png")}/>
                <Text className="text-5xl text-white" style={{fontFamily: "Kenia_400Regular"}}>AshChat</Text>
            </View>
            <KeyboardAvoidingView className="gap-3">
                <Input placeholder="Email" icon="email"/>
                <InputPassword placeholder="Password"/>
                <Text className="text-sm font-semibold text-purple-700 mb-4">Forgot you password? Click here!</Text>
                <Button title="Sign in"/>
                <View className="text-center items-center mt-2">
                    <Text className="text-sm font-semibold text-purple-700 mb-4">
                    Don’t have a account? Sign Up
                    </Text>
                </View>
            </KeyboardAvoidingView>
        </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    )
}