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