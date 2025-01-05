import { SocketContext } from "@/src/contexts/socketContext";
import { UserProfileProps } from "@/src/persistence/MMKVStorage";
import { colors } from "@/src/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
import { Alert, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useMMKVObject } from "react-native-mmkv";
import { Input } from "../Input";
import { PhoenixAPIClient } from "@/src/api/phoenix-api-client";
import SecureStoragePersistence from "@/src/persistence/SecureStorage";
import { Button } from "../Button";

type ModalAddProps = {
    modalIsOpen: boolean;
    closeModal: (isOpen: boolean) => void;
}
export function ModalChangeDescription({modalIsOpen, closeModal}:ModalAddProps){
    const {mmkvStorage} = useContext(SocketContext)
    const [userProfile] = useMMKVObject<UserProfileProps>("ashchat.user_profile")
    const [newDescription, setNewDescription] = useState("");

    useEffect(()=> {
        if(userProfile){
            setNewDescription(userProfile.description)
        }
    }, [userProfile])

    async function handleChangeDescription() {
        const api = PhoenixAPIClient
        const token = await SecureStoragePersistence.getJWT()
        const device_token = await SecureStoragePersistence.getUniqueDeviceId()
        if(!token || !device_token) return
        api.setTokenAuth(token)
        api.setHeader("device_token", device_token)
        if(newDescription.length > 0 && newDescription.length <= 150){
            const response = await api.server.patch("/user/description/", {
                description: newDescription
            })

            if(response.status == 200){
                const newProfile: UserProfileProps = {
                    ...userProfile,
                    description: newDescription
                } as UserProfileProps
                mmkvStorage.setUserProfile(newProfile)
                closeModal(false)
            }else{
                Alert.alert("Error", "An error occurred while creating the chat")
            }
        }else{
            Alert.alert("Invalid Description", "Please enter a description with more then 0 characters and less then 150 characters")
        }
    }

    return (
        <Modal transparent visible={modalIsOpen} animationType="slide">
        <View className="flex-1 h-full justify-end">
            <View className="bg-gray-900 items-center gap-5 p-10 pb-20">
            {/* Close */}
            <View className="w-full flex-row justify-between mb-[10]"> 
                <TouchableOpacity onPress={()=>closeModal(false)}>
                    <Text className="text-purple-700 text-lg">Cancel</Text>
                </TouchableOpacity>
                <View className="gap-2 items-center flex-row">
                    <Text className="text-white text-lg font-semibold">
                        Description 
                    </Text>
                    <Text className={150 - newDescription.length <= 0 ? "text-red-600 text-lg font-bold" : "text-white text-lg font-bold"}>
                        ({150 - newDescription.length})
                    </Text>
                </View>
                <TouchableOpacity onPress={handleChangeDescription}>
                    <Text className="text-purple-700 text-lg">Save</Text>
                </TouchableOpacity>
            </View>
            <TextInput
                className="w-[330] max-w-[330] h-[300] max-h-[300] p-4 placeholder:text-gray-700 bg-white rounded-lg text-start"
                value={newDescription}
                onChangeText={setNewDescription}
                placeholder="New Name"
                autoCapitalize="none"
                multiline={true}
                textAlignVertical="top" 
            />
            </View>
        </View>
        </Modal>
    )
}