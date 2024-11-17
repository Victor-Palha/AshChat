import { Alert, Modal, TouchableOpacity, View } from "react-native";
import { Input } from "../Input";
import { useState } from "react";
import { Button } from "../Button";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/src/styles/colors";
import { router } from "expo-router";

type ModalAddProps = {
    modalIsOpen: boolean;
    closeModal: (isOpen: boolean) => void;
}
export function ModalAdd({modalIsOpen, closeModal}: ModalAddProps) {
    const [contactId, setContactId] = useState("");

    function handleCreateChat() {
        // 673a2142655523f2b2cd4ec3 id
        if(contactId.length == 24 ){
            closeModal(false)
            router.push({
                pathname: "/private/chat",
                params: {
                    receiverId: contactId
                }
            })
        }
        else{
            Alert.alert("Invalid ID", "Please enter a valid ID")
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
                placeholder="Add contact using ID"
                autoCapitalize="none"
                value={contactId}
                onChangeText={setContactId}
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