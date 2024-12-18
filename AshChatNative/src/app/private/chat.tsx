import { SocketContext } from "@/src/contexts/socketContext";
import { AddMessageProps, MessageProps } from "@/src/persistence/MMKVStorage";
import { colors } from "@/src/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Channel } from "phoenix";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from "react-native";

export default function Chat(): JSX.Element {
  const { chat_id, nickname, profile_picture } = useLocalSearchParams();
  const { socket, mmkvStorage, user_id } = useContext(SocketContext);

  // States
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [channel, setChannel] = useState<Channel | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  // Load initial messages
  useEffect(() => {
    const response = mmkvStorage.getChat(chat_id as string);

    if (!response) return;
    if (!response.searched_chats) {
      Alert.alert("Chat not found");
      router.back();
      return;
    }
    console.log("Chat found");
    setProfilePicture(response.searched_chats.profile_picture);
    setMessages(response.searched_chats.messages);
  }, [chat_id, mmkvStorage]);

  // Join the chat channel when the screen is focused
  useFocusEffect(
    useCallback(() => {
      if (!socket) return;

      const chatChannel = socket.channel(`chat:${chat_id}`, {});
      chatChannel
        .join()
        .receive("ok", () => {
          console.log("Channel joined");
        })
        .receive("error", () => {
          console.log("Failed to join channel");
        });

      setChannel(chatChannel);

      mmkvStorage.updatingAllMessagesFromAChat(chat_id as string);

      return () => {
        chatChannel.leave();
        console.log("Channel left");
      };
    }, [chat_id, socket])
  );

  function handleReceiveMessage({ chat_id, content, sender_id }: AddMessageProps) {
    const who = sender_id === user_id ? "user" : "contact";

    const newMessage = mmkvStorage.addMessage({
      chat_id,
      content,
      sender_id: who,
      timestamp: new Date().toISOString(),
    }) as MessageProps;

    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  function handleMessageSent({ chat_id, status, message_id }: any){
    mmkvStorage.updateMessageStatus({
      chat_id,
      id_message: message_id,
      status,
    });
  };

  function handleCloseChat(){
    channel?.leave();
    router.back();
  };

  function handleSend(){
    if (inputMessage.trim()) {
      const newMessage = mmkvStorage.addMessage({
        chat_id: chat_id as string,
        content: inputMessage,
        sender_id: "user",
        timestamp: new Date().toISOString(),
      }) as MessageProps;

      channel?.push("send_message", { mobile_ref_id: newMessage.id_message, content: inputMessage });

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputMessage("");
    }
  };

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (flatListRef.current) flatListRef.current.scrollToEnd({ animated: true });
  }, [messages]);

  channel?.on("receive_message", handleReceiveMessage);
  channel?.on("message_sent", handleMessageSent);

  const renderMessage = ({ item }: { item: MessageProps }) => (
    <View
      className={`my-2 p-3 rounded-xl ${
        item.sender_id === "user" ? "bg-purple-700 self-end" : "bg-gray-950 self-start"
      }`}
    >
      <Text className="text-white">{item.content}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-700 pt-[60px]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      {/* Header */}
      <View className="flex-row border-b-[1px] border-purple-700 p-3 items-center">
        <TouchableOpacity onPress={handleCloseChat}>
          <MaterialIcons name="keyboard-arrow-left" size={34} color={colors.purple[700]} />
        </TouchableOpacity>
        <View className="flex-row items-center ml-3">
          {profilePicture && <Image source={{ uri: profilePicture }} className="w-12 h-12 rounded-full" />}
          <Text className="text-white font-bold text-2xl ml-3">{nickname}</Text>
        </View>
      </View>

      {/* Lista de Mensagens */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id_message}
        renderItem={renderMessage}
        className="flex-1 px-4 py-2"
        contentContainerStyle={{ flexGrow: 1 }}
      />

      {/* Campo de Entrada */}
      <View className="bg-gray-900 p-3 pb-12">
        <View className="bg-gray-200 rounded-full flex-row items-center">
          <TextInput
            className="flex-1 rounded-full bg-gray-200 px-4 py-2 text-gray-800"
            placeholder="Message..."
            value={inputMessage}
            onChangeText={setInputMessage}
            keyboardType="default"
          />
          <TouchableOpacity
            className="ml-2 bg-purple-700 rounded-full p-3 m-1"
            onPress={handleSend}
          >
            <MaterialIcons name="send" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
