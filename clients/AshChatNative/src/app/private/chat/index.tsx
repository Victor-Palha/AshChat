import { ContactProfile } from "@/src/components/ContactProfile";
import { LoadMessages } from "@/src/components/LoadMessages";
import { colors } from "@/src/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useRef } from "react";
import { ChatViewModel } from "./chat-view-model";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";

export default function index(){
  const { chat_id, nickname } = useLocalSearchParams();
  const {
    profilePicture,
    modalDescriptionProps,
    isModalDescriptionOpen,
    isReceiverOnline,
    messages,
    isUserTyping,
    inputMessage,
    userId,
    handleGetOlderMessages,
    handleCloseChat,
    handleOpenAndCloseModalDescription,
    handleWriteMessage,
    handleSendMessage,
    handleGroupMessages,
    handleNormalizeDate
  } = ChatViewModel({ chat_id });

  const groupedMessages = handleGroupMessages(messages);
  const flatListRef = useRef<FlatList>(null);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-700 pt-[60px]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ContactProfile
        imageProfile={profilePicture as string}
        name={nickname as string}
        description={modalDescriptionProps?.description as string}
        tag_user_id={modalDescriptionProps?.tag_user_id as string}
        modalIsOpen={isModalDescriptionOpen}
        closeModal={handleOpenAndCloseModalDescription}
      />
      {/* Header */}
      <View className="flex-row border-b-[1px] border-purple-700 p-3 items-center">
        <TouchableOpacity onPress={handleCloseChat}>
          <MaterialIcons name="keyboard-arrow-left" size={34} color={colors.purple[700]} />
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center ml-3" onPress={handleOpenAndCloseModalDescription}>
          {profilePicture && <Image source={{ uri: profilePicture }} className="w-12 h-12 rounded-full" />}
          <Text className="text-white font-bold text-2xl ml-3">{nickname}</Text>
          {/* Online? */}
          {isReceiverOnline && <View className="w-3 h-3 bg-green-500 rounded-full ml-2" />}
          {!isReceiverOnline && <View className="w-3 h-3 bg-red-500 rounded-full ml-2" />}
        </TouchableOpacity>
      </View>

      {/* Message List */}
      <FlatList
      ref={flatListRef}
      data={groupedMessages}
      keyExtractor={(item) => ("id_message" in item ? item.id_message : item.id)}
      renderItem={({ item, index }) => {
        const lastMessageDate =
            index < groupedMessages.length - 1 ? handleNormalizeDate(groupedMessages[index + 1].timestamp) : undefined;
        return <LoadMessages item={item} user_id={userId} lastMessageDate={lastMessageDate} />;
    }}
      className="flex-1 px-4 py-2"
      contentContainerStyle={{ flexGrow: 1 }}
      inverted={true} // Mantemos invertido
      initialNumToRender={20}
      maxToRenderPerBatch={10}
      windowSize={5}
      onEndReachedThreshold={0.1}
      onEndReached={() => handleGetOlderMessages}
      removeClippedSubviews={true}
    />
      {/* Typing */}
      {isUserTyping && (
        <View className="px-4 pb-2">
          <Text className="text-purple-400 text-sm font-medium">Typing...</Text>
        </View>
      )}
      {/* Keyboard Area */}
      <View className="bg-gray-900 p-3 pb-12">
        <View className="bg-gray-200 rounded-full flex-row items-center">
          <TextInput
            className="flex-1 rounded-full bg-gray-200 px-4 py-2 text-gray-800"
            placeholder="Message..."
            value={inputMessage}
            onChangeText={handleWriteMessage}
            keyboardType="default"
          />
          <TouchableOpacity
            className="ml-2 bg-purple-700 rounded-full p-3 m-1"
            onPress={handleSendMessage}
          >
            <MaterialIcons name="send" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
