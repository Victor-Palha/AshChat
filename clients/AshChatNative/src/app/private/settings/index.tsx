import { Footer } from "@/src/components/Footer";
import { MaterialIcons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { ModalChangeName } from "@/src/components/ModalChangeName";
import { ModalChangeDescription } from "@/src/components/ModalChangeDescription";
import { SettingsViewModel } from "./settings-view-model";

export default function Settings(){
    const {
        userProfile,
        profilePicture,
        isModalOpenToChangeDescription,
        isModalOpenToChangeUserName,
        handleLogout,
        handleOpenModalToChangeDescription,
        handleOpenModalToChangeUserName,
        handleSelectNewProfilePhoto
    } = SettingsViewModel();
 
    return (
        <View className="flex-1 pt-[62px] px-10">
            <Text className="font-bold text-white text-3xl">Settings</Text>
            <View className="items-center mt-10 gap-2">
                <TouchableOpacity onPress={handleSelectNewProfilePhoto}>
                    <Image source={{uri: profilePicture}} style={{width: 100, height: 100, borderRadius: 50}}/>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center gap-2" onPress={handleOpenModalToChangeUserName}>
                    <Text className="text-white font-bold text-xl mt-3">
                        {userProfile?.nickname}
                    </Text>
                    <MaterialIcons name="edit" size={20} color="#8075FF"/>
                </TouchableOpacity>

                <Text className="text-white italic text-sm">{userProfile?.tag_user_id}</Text>
            </View>
            <TouchableOpacity className="mt-5 bg-gray-800 p-5 rounded-2xl max-h-[100] overflow-auto" onPress={handleOpenModalToChangeDescription}>
                <Text className="text-white">{userProfile?.description}</Text>
            </TouchableOpacity>
            <View className="mt-5 bg-gray-800 p-5 rounded-2xl">
                <Text className="text-white">Preferred Language: {userProfile?.preferred_language}</Text>
            </View>
            {/* Logout Button */}
            <TouchableOpacity className="mt-56 bg-red-500 p-5 rounded-2xl items-center" onPress={handleLogout}>
                <Text className="text-white font-bold">Logout</Text>
            </TouchableOpacity>

            {/* Modal */}
            <ModalChangeName modalIsOpen={isModalOpenToChangeUserName} closeModal={handleOpenModalToChangeUserName}/>
            <ModalChangeDescription modalIsOpen={isModalOpenToChangeDescription} closeModal={handleOpenModalToChangeDescription}/>
            <Footer activeTab="settings"/>
        </View>
    )
}