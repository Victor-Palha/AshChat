import { AuthContext } from "@/src/contexts/auth/authContext";
import { UserProfilePropsDTO } from "@/src/persistence/MMKVStorage/DTO/UserProfilePropsDTO";
import { MMKVStorageProfile } from "@/src/persistence/MMKVStorage/MMKVProfile";
import { useCallback, useContext, useState } from "react";
import { useMMKVObject } from "react-native-mmkv";
import * as ImagePicker from 'expo-image-picker';
import { PhoenixAPIClient } from "@/src/api/phoenix-api-client";
import SecureStoragePersistence from "@/src/persistence/SecureStorage";
import { Alert } from "react-native";
import { API_URLS } from "@/src/constants/api-urls";

export function SettingsViewModel() {
    const {onLogout} = useContext(AuthContext)
    const [userProfile] = useMMKVObject<UserProfilePropsDTO>("ashchat.user_profile")
    const [StorageProfile] = useState(new MMKVStorageProfile());
    const [isModalOpenToChangeUserName, setIsModalOpenToChangeUserName] = useState(false);
    const [isModalOpenToChangeDescription, setIsModalOpenToChangeDescription] = useState(false);

    function handleOpenModalToChangeUserName() {
        setIsModalOpenToChangeUserName(!isModalOpenToChangeUserName);
    }

    function handleOpenModalToChangeDescription() {
        setIsModalOpenToChangeDescription(!isModalOpenToChangeDescription);
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
                if(responseUpload.status == 200){
                    const {url} = responseUpload.data

                    const newProfile: UserProfilePropsDTO = {
                        ...userProfile,
                        photo_url: API_URLS.STATIC_SERVICE+url
                    } as UserProfilePropsDTO
                    
                    StorageProfile.setUserProfile(newProfile)
                }
            } catch (error) {
                console.log(error)
                Alert.alert("Error", "An error occurred while uploading the photo")
            }
        }
    };

    async function handleLogout() {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            {
                text: "Cancel",
                style: "cancel"
            },
            {
                text: "Logout",
                onPress: onLogout
            }
        ])
    }

    return {
        handleOpenModalToChangeUserName,
        handleOpenModalToChangeDescription,
        handleSelectNewProfilePhoto,
        handleLogout,
        userProfile,
        isModalOpenToChangeUserName,
        isModalOpenToChangeDescription,
        profilePicture: userProfile?.photo_url
    }
}