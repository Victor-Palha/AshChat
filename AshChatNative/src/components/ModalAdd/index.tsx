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

export function ModalAdd({modalIsOpen, closeModal}: ModalAddProps) {
    const {mmkvStorage} = useContext(SocketContext)
    const [userTag, setUserTag] = useState("");

    async function handleCreateChat() {
        const api = PhoenixAPIClient
        const token = await SecureStoragePersistence.getJWT()
        const device_token = await SecureStoragePersistence.getUniqueDeviceId()
        if(!token) return
        api.setTokenAuth(token)
        if(userTag.length > 0){
            const response = await api.server.post("/chat", {
                receiver_tag: userTag
            }, {
                headers: {
                    "device_token": device_token,
                }
            })

            if(response.status == 201){
                const {chat_id, messages, nickname, profile_picture} = response.data
                mmkvStorage.addChat({
                    chat_id,
                    messages,
                    nickname,
                    profile_picture
                })
                Alert.alert("Success", "Chat created successfully")
                closeModal(false)
            }else{
                Alert.alert("Error", "An error occurred while creating the chat")
            }
        }else{
            Alert.alert("Invalid Tag", "Please enter a valid Tag")
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