import { colors } from "@/src/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";

type ContactProfileProps = {
    imageProfile?: string;
    name?: string;
    description?: string;
    tag_user_id?: string;
    modalIsOpen: boolean;
    closeModal: (isOpen: boolean) => void;
};
export function ContactProfile(data: ContactProfileProps){

    return (
        <Modal transparent visible={data.modalIsOpen} animationType="fade">
            <View className="flex-1 h-full justify-start">
                <View className="bg-gray-900 items-center gap-5 p-10 pb-20 border-b-[1px] border-purple-700">
                    {/* Close */}
                    <View className="w-full flex-row justify-start m-[10]"> 
                        <TouchableOpacity onPress={()=>data.closeModal(false)}>
                            <MaterialIcons name="arrow-back-ios-new" size={22} color={colors.purple[700]}/>
                        </TouchableOpacity>
                    </View>
                    <View className="items-center mt-10 gap-2">
                        <TouchableOpacity>
                            <Image source={{uri: data.imageProfile}} style={{width: 100, height: 100, borderRadius: 50}}/>
                        </TouchableOpacity>
                            <Text className="text-white font-bold text-xl mt-3">
                                {data.name}
                            </Text>
                            <Text className="text-white italic text-sm">{data.tag_user_id}</Text>
                    </View>
                    <View className="mt-5 p-5 rounded-2xl max-h-[100] overflow-auto">
                        <Text className="text-white">{data.description}</Text>
                    </View>
                </View>
            </View>
        </Modal>
    )
}