import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { InputPassword } from "@/src/components/InputPassword";
import { languages } from "@/src/constants/languages";
import { Link, router } from "expo-router";
import { useState } from "react";
import { 
    FlatList, 
    Keyboard, 
    KeyboardAvoidingView, 
    Platform, 
    Text, 
    TouchableOpacity, 
    TouchableWithoutFeedback, 
    View 
} from "react-native";
import CountryFlag from 'react-native-country-flag';


type Languages = typeof languages[0];

export default function Signup(){
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<Languages | null>(null);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
            className="flex-1 pt-[62px] items-center justify-center text-white px-[53]"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} 
        >
            <View className="gap-2">
                <Text className="font-bold text-white text-lg">Create an account!</Text>
                <Text className="italic text-white">We'll send a code to your email address to confirm your identity.</Text>
            </View>

            <View className="gap-2 mt-5 mb-7">
                <Input placeholder="Username" icon="person"/>
                <Input placeholder="Email" icon="email" autoCapitalize="none"/>
                <InputPassword placeholder="Password"/>
                <InputPassword placeholder="Confirm Password"/>
                {/* Language Dropdown */}
                <TouchableOpacity
                    onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="border border-gray-300 p-3 rounded-md bg-white flex-row justify-between items-center"
                >
                    <Text className="text-black">
                    {
                    selectedLanguage ? 
                    <SelectedLanguage flag={selectedLanguage.flag} label={selectedLanguage.label} value={selectedLanguage.value}/>:
                    "Select a language"
                    }
                    </Text>
                </TouchableOpacity>

                {isDropdownOpen && (
                    <View className="border border-gray-300 rounded-md bg-white max-h-48 overflow-hidden mt-2">
                    <FlatList
                        data={languages}
                        keyExtractor={(item) => item.value}
                        renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => {
                                setSelectedLanguage(item);
                                setIsDropdownOpen(false);
                            }}
                            className="flex-row items-center p-3 border-b border-gray-200"
                        >
                            <CountryFlag isoCode={item.flag} size={20} />
                            <Text className="ml-2 text-black">{item.label}</Text>
                        </TouchableOpacity>
                        )}
                        className="w-full"
                    />
                    </View>
                )}
                {/* End of Language Dropdown */}
            </View>
            <Button title="Sign up"  onPress={()=>router.push("/confirmsignup")}/>
            <View className="text-center items-center mt-2">
                <Link href="/login" className="text-sm font-semibold text-purple-700 mb-4">
                Already have a account? Sign in
                </Link>
            </View>
        </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    )
}

function SelectedLanguage({flag, label}: Languages){
    return (
        <View className="flex-row items-center">
            <CountryFlag isoCode={flag} size={20} />
            <Text className="ml-2 text-black">{label}</Text>
        </View>
    )
}