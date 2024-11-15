import { Button } from "@/src/components/Button";
import { Gradient } from "@/src/components/Grandient";
import { Input } from "@/src/components/Input";
import { InputPassword } from "@/src/components/InputPassword";
import { AuthContext } from "@/src/contexts/authContext";
import { useValidate } from "@/src/hooks/useValidate";
import { Link, router } from "expo-router";
import { useContext, useState } from "react";
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, Text, TouchableWithoutFeedback, View } from "react-native";

export default function Login(){
    useValidate()
    const {onLogin} = useContext(AuthContext)

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin(){
        if(!email || !password){
            return Alert.alert("Please fill all the fields")
        }
        try {
            await onLogin(email, password)
        } catch (error) {
            console.log(error)
        }
    }
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
                <Input 
                    placeholder="Email" 
                    icon="email" 
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />
                <InputPassword 
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                />

                <Text className="text-sm font-semibold text-purple-700 mb-4">Forgot you password? Click here!</Text>
                <Button title="Sign in" onPress={handleLogin}/>

                <View className="text-center items-center mt-2">
                    <Link href="/signup" className="text-sm font-semibold text-purple-700 mb-4">
                    Don’t have a account? Sign Up!
                    </Link>
                </View>
            </KeyboardAvoidingView>

        </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    )
}