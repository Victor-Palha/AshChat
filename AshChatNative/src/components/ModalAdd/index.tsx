import { Alert, Modal, TouchableOpacity, View } from "react-native";
import { Input } from "../Input";
import { useContext, useState } from "react";
import { Button } from "../Button";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/src/styles/colors";
import { SocketContext } from "@/src/contexts/socketContext";
import { PhoenixAPIClient } from "@/src/api/phoenix-api-client";
import SecureStoragePersistence from "@/src/persistence/SecureStorage";
type ModalAddProps = {
    modalIsOpen: boolean;
    closeModal: (isOpen: boolean) => void;
}

type ResponseDataModalAdd = {
    chat_id: string;
    messages: [];
    nickname: string;
    profile_picture: string;
    description: string;
    preferred_language: string;
}

export function ModalAdd({modalIsOpen, closeModal}: ModalAddProps) {
    const {mmkvStorage} = useContext(SocketContext)
    const [userTag, setUserTag] = useState("");

    async function handleCreateChat() {
        const api = PhoenixAPIClient
        const token = await SecureStoragePersistence.getJWT()
        const device_token = await SecureStoragePersistence.getUniqueDeviceId()
        if(!token || !device_token) return
        api.setTokenAuth(token)
        api.setHeader("device_token", device_token)
        if(userTag.length < 1) Alert.alert("Invalid Tag", "Please enter a valid Tag")

        const response = await api.server.post("/chat", {
            receiver_tag: userTag
        })

        if(response.status == 201){
            let profile_url = ""
            const {chat_id, messages, nickname, profile_picture, description, preferred_language} = response.data as ResponseDataModalAdd
            if(profile_picture.startsWith("https")){
                profile_url = profile_picture
            }  else {
                profile_url = `http://localhost:3006/${profile_picture}`
            }
            mmkvStorage.addChat({
                chat_id,
                messages,
                nickname,
                profile_picture,
                description,
                preferred_language
            })
            Alert.alert("Success", "Chat created successfully")
            closeModal(false)
        }else{
            Alert.alert("Error", "An error occurred while creating the chat")
        }
        
    }

    return (
        <Modal transparent visible={modalIsOpen} animationType="slide">
        <View className="flex-1 justify-end">
            <View className="bg-gray-900 items-center gap-5 p-10 pb-20">
            {/* Close */}
            <View className="w-full flex-row justify-end mb-[10]"> 
                <TouchableOpacity onPress={()=>closeModal(false)}>
                    <MaterialIcons name="close" size={20} color={colors.purple[700]}/>
                </TouchableOpacity>
            </View>
            <Input
                icon="person-pin-circle"
                placeholder="Add contact using TAG"
                autoCapitalize="none"
                value={userTag}
                onChangeText={setUserTag}
            />

            <Button
                title="Add"
                onPress={handleCreateChat}
            />
            </View>
        </View>
        </Modal>
    )
}