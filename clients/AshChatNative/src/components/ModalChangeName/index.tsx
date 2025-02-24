import { Alert, Modal, Text, TouchableOpacity, View } from "react-native";
import { Input } from "../Input";
import { useEffect, useState } from "react";
import { Button } from "../Button";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/src/styles/colors";
import { PhoenixAPIClient } from "@/src/api/phoenix-api-client";
import SecureStoragePersistence from "@/src/persistence/SecureStorage";
import { useMMKVObject } from "react-native-mmkv";
import { UserProfilePropsDTO } from "@/src/persistence/MMKVStorage/DTO/UserProfilePropsDTO";
import { MMKVStorageProfile } from "@/src/persistence/MMKVStorage/MMKVProfile";
type ModalAddProps = {
    modalIsOpen: boolean;
    closeModal: (isOpen: boolean) => void;
}

export function ModalChangeName({modalIsOpen, closeModal}: ModalAddProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [userProfile] = useMMKVObject<UserProfilePropsDTO>("ashchat.user_profile")
    const [mmkvStorage] = useState(new MMKVStorageProfile())
    const [newName, setNewName] = useState("");

    useEffect(()=> {
        if(userProfile){
            setNewName(userProfile.nickname)
        }
    }, [userProfile])

    async function handleChangeUsername() {
        const api = PhoenixAPIClient
        const token = await SecureStoragePersistence.getJWT()
        const device_token = await SecureStoragePersistence.getUniqueDeviceId()
        if(!token || !device_token) return
        api.setTokenAuth(token)
        api.setHeader("device_token", device_token)
        if(newName.length > 3){
            setIsLoading(true)
            const response = await api.server.patch("/user/nickname/", {
                nickname: newName
            })

            if(response.status == 200){
                const newProfile: UserProfilePropsDTO = {
                    ...userProfile,
                    nickname: newName
                } as UserProfilePropsDTO
                mmkvStorage.setUserProfile(newProfile)
                closeModal(false)
            }else{
                Alert.alert("Error", "An error occurred while creating the chat")
            }
        }else{
            Alert.alert("Invalid Name", "Please enter a name with more then 3 characters")
        }
        setIsLoading(false)
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
            <Text className="text-white text-lg font-semibold">Change profile name</Text>
            <Input
                icon="person"
                placeholder="New Name"
                autoCapitalize="none"
                value={newName}
                onChangeText={setNewName}
            />

            <Button
                title="Save"
                onPress={handleChangeUsername}
                isLoading={isLoading}
            />
            </View>
        </View>
        </Modal>
    )
}