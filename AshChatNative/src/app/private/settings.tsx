import { Footer } from "@/src/components/Footer";
import { MMKVStorage, UserProfileProps } from "@/src/persistence/MMKVStorage";
import { MaterialIcons } from "@expo/vector-icons";
import { Alert, Button, Image, Text, TouchableOpacity, View } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useMMKVObject } from "react-native-mmkv";
import { useState } from "react";
import { PhoenixAPIClient } from "@/src/api/phoenix-api-client";
import SecureStoragePersistence from "@/src/persistence/SecureStorage";
import { ModalChangeName } from "@/src/components/ModalChangeName";

export default function Settings(){
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userProfile] = useMMKVObject<UserProfileProps>("ashchat.user_profile")

    function handleOpenModal() {
        setIsModalOpen(!isModalOpen);
    }

    async function handleSelectNewProfilePhoto(){
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });

        if (!result.canceled) {
            const api = PhoenixAPIClient
            const token = await SecureStoragePersistence.getJWT()
            const device_token = await SecureStoragePersistence.getUniqueDeviceId()
            if(!token || !device_token) return
            api.setTokenAuth(token)
            api.setHeader("device_token", device_token)
            const formData = new FormData();
            const uri = result.assets[0].uri
            const image = {
                uri: uri,
                type: 'image/jpeg',
                name: 'photo.jpg',
            } as any
            formData.append("photo", image);
            try {
                const responseUpload = await api.server.patch("/user/photo", formData)            
                console.log(responseUpload.data)
                if(responseUpload.status == 200){
                    const {url} = responseUpload.data

                    const newProfile: UserProfileProps = {
                        ...userProfile,
                        photo_url: url
                    } as UserProfileProps
                    new MMKVStorage().setUserProfile(newProfile)
                }
            } catch (error) {
                console.log(error)
                Alert.alert("Error", "An error occurred while uploading the photo")
            }
        }
    };
    return (
        <View className="flex-1 pt-[62px] px-10">
            <Text className="font-bold text-white text-3xl">Settings</Text>
            <View className="items-center mt-10 gap-2">
                <TouchableOpacity onPress={handleSelectNewProfilePhoto}>
                    <Image source={{uri: "http://localhost:3000" + userProfile?.photo_url}} style={{width: 100, height: 100, borderRadius: 50}}/>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center gap-2" onPress={handleOpenModal}>
                    <Text className="text-white font-bold text-xl mt-3">
                        {userProfile?.nickname}
                    </Text>
                    <MaterialIcons name="edit" size={20} color="#8075FF"/>
                </TouchableOpacity>

                <Text className="text-white italic text-sm">{userProfile?.tag_user_id}</Text>
            </View>
            <View className="mt-5 bg-gray-800 p-5 rounded-2xl">
                <Text className="text-white">{userProfile?.description}</Text>
            </View>
            <View className="mt-5 bg-gray-800 p-5 rounded-2xl">
                <Text className="text-white">Preferred Language: {userProfile?.preferred_language}</Text>
            </View>

            {/* Modal */}
            <ModalChangeName modalIsOpen={isModalOpen} closeModal={handleOpenModal}/>
            <Footer activeTab="settings"/>
        </View>
    )
}