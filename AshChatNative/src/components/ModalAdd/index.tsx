import { Alert, Modal, TouchableOpacity, View } from "react-native";
import { Input } from "../Input";
import { useContext, useState, useEffect } from "react";
import { Button } from "../Button";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/src/styles/colors";
import { router } from "expo-router";
import { SocketContext } from "@/src/contexts/socketContext";
import { AuthContext } from "@/src/contexts/authContext";

type ModalAddProps = {
    modalIsOpen: boolean;
    closeModal: (isOpen: boolean) => void;
}

type ChatCreatedEventProps = {
    chat_id: string
    messages: []
    nickname: string
}

export function ModalAdd({modalIsOpen, closeModal}: ModalAddProps) {
    const {ioServer, mmkvStorage} = useContext(SocketContext)
    // Constants

    // Listeners
    const [contactId, setContactId] = useState("");
    // Listeners
    useEffect(() => {
        ioServer.socket.on("chat-created", ({chat_id, messages, nickname}: ChatCreatedEventProps) => {
            mmkvStorage.addChat({
                chat_id,
                messages,
                nickname
            })
            Alert.alert("Success", "Chat created successfully")
            closeModal(false)
        })

        ioServer.socket.on("create-chat-error", ({message}) => {
            Alert.alert("Error", message)
        })

        return () => {
            ioServer.socket.off("chat-created")
            ioServer.socket.off("create-chat-error")
        }
    }, [ioServer.socket, mmkvStorage, closeModal])

    function handleCreateChat() {
        // 673a2142655523f2b2cd4ec3 id
        if(contactId.length == 24 ){
            ioServer.socket.emit("create-chat", {
                receiverId: contactId
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