import { useContext, useRef, useState } from "react";
import { Alert, Keyboard, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { AuthContext } from "../contexts/auth/authContext";
import { InputPassword } from "../components/InputPassword";
import { Button } from "../components/Button";

export default function ResetPassword(){
    const {onResetPassword} = useContext(AuthContext)

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const inputs = useRef<Array<TextInput | null>>([]);

    function handleChange(text: string, index: number) {
        const newCode = [...code];
        newCode[index] = text;
    
        setCode(newCode);
    
        // Move to the next input if a digit is entered
        if (text && index < inputs.current.length - 1) {
            inputs.current[index + 1]?.focus();
        }
    
        // Move to the previous input if the field is empty and backspace was pressed
        if (!text && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    async function handleConfirmNewDevice(){
        const codeValue = code.join('');
        if (newPassword.length < 6 || newPassword.length > 20){
            return Alert.alert("Password must be between 6 and 20 characters");
        }
        if (newPassword !== confirmPassword){
            return Alert.alert("Passwords do not match");
        }
        await onResetPassword(codeValue, newPassword);
    }

    return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 pt-[62px] items-center justify-center">
                <View className="items-center justify-center px-[45] mb-10">
                    <Text className="text-white font-bold text-lg mb-5">Get your Code to reset your password</Text>
                    <Text className="text-white italic">Please, enter the 6 digit code that send to your email address.</Text>
                </View>
    
                <View className="flex-row justify-between px-5 gap-2 mb-10">
                    {code.map((digit, index) => (
                        <TextInput
                        key={index}
                        ref={(input) => (inputs.current[index] = input)}
                        className="w-12 h-12 border border-gray-300 rounded-lg text-3xl text-center bg-white"
                        value={digit}
                        onChangeText={(text) => handleChange(text, index)}
                        keyboardType="number-pad"
                        maxLength={1}
                        />
                    ))}
                </View>
                <View className="px-5 gap-2 mb-10">
                    <InputPassword
                        placeholder="New password"
                        autoCapitalize="none"
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                    <InputPassword
                        placeholder="Confirm password"
                        autoCapitalize="none"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                </View>
                <Button title="Verify and Proceed" onPress={handleConfirmNewDevice}/>
            </View>
            </TouchableWithoutFeedback>
        )
}