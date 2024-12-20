import { LoadMessages } from "@/src/components/LoadMessages";
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
  const { chat_id, nickname } = useLocalSearchParams();
  const { socket, mmkvStorage, user_id } = useContext(SocketContext);

  // States
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [channel, setChannel] = useState<Channel | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isReceiverOnline, setIsReceiverOnline] = useState<boolean>(false);

  // Load chat messages and divide into chunks
  useEffect(() => {
    const response = mmkvStorage.getChat(chat_id as string);
  
    if (!response) return;
    if (!response.searched_chats) {
      Alert.alert("Chat not found");
      router.back();
      return;
    }
    mmkvStorage.clearNotifications(chat_id as string);
    setProfilePicture(response.searched_chats.profile_picture);
  
    // Ordena as mensagens por timestamp
    const sortedMessages = response.searched_chats.messages.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  
    setMessages(sortedMessages);
  }, [chat_id, mmkvStorage]);
  
  // Join the chat channel when the screen is focused
  useFocusEffect(
    useCallback(() => {
      if (!socket) return;

      const chatChannel = socket.channel(`chat:${chat_id}`, {});

      chatChannel
        .join()
        .receive("ok", () => {})
        .receive("error", () => {});

      setChannel(chatChannel);
      chatChannel.on("receiver_online", ({ status }: { status: boolean }) => {
        setIsReceiverOnline(status);
      });

      // Receive messages from the chat channel
      const handleReceiveMessage = (message: AddMessageProps) => {
        const who = message.sender_id === user_id ? "user" : "contact";
        const newMessage = mmkvStorage.addMessage({
          ...message,
          sender_id: who,
          timestamp: new Date().toISOString(),
        }) as MessageProps;
        setMessages((prevMessages) => [newMessage, ...prevMessages]);
      };

      // Update message status
      const handleMessageSent = ({ chat_id, status, message_id }: any) => {
        mmkvStorage.updateMessageStatus({
          chat_id,
          id_message: message_id,
          status: status,
        });
      };

      // Add event listeners
      chatChannel.on("receive_message", handleReceiveMessage);
      chatChannel.on("message_sent", handleMessageSent);

      // Remove event listeners when the screen is unfocused
      return () => {
        chatChannel.leave();
        chatChannel.off("receive_message");
        chatChannel.off("message_sent");
      };
    }, [chat_id, socket, user_id])
  );
  // Load more messages when reaching the end
  function getOlderMessages(chat_id: string, offset: number): MessageProps[] {
    // Simula a obtenção de mensagens mais antigas
    const chat = mmkvStorage.getChat(chat_id);
    if (!chat || !chat.searched_chats) return [];
    return chat.searched_chats.messages.slice(offset, offset + 20).reverse();
  }

  // Close the chat and leave the channel
  function handleCloseChat() {
    channel?.leave();
    router.back();
  }

  // Send a message to the chat channel
  function handleSend() {
    if (inputMessage.trim()) {
      const newMessage = mmkvStorage.addMessage({
        chat_id: chat_id as string,
        content: inputMessage,
        sender_id: "user",
        timestamp: new Date().toISOString(),
      }) as MessageProps;
      channel?.push("send_message", { mobile_ref_id: newMessage.id_message, content: inputMessage });

      setMessages((prevMessages) => [newMessage, ...prevMessages]);
      setInputMessage("");
    }
  }

  const flatListRef = useRef<FlatList>(null);

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
          {/* Online? */}
          {isReceiverOnline && <View className="w-3 h-3 bg-green-500 rounded-full ml-2" />}
          {!isReceiverOnline && <View className="w-3 h-3 bg-red-500 rounded-full ml-2" />}
        </View>
      </View>

      {/* Lista de Mensagens */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id_message}
        renderItem={LoadMessages}
        className="flex-1 px-4 py-2"
        contentContainerStyle={{ flexGrow: 1 }}
        inverted={true} // Inverte a ordem das mensagens
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={5}
        onEndReachedThreshold={0.1} // Define a proximidade para carregar mais mensagens
        onEndReached={() => {
          // Função para carregar mensagens mais antigas
          const oldMessages = getOlderMessages(chat_id as string, messages.length);
          if (oldMessages.length > 0) {
            setMessages((prevMessages) => [...prevMessages, ...oldMessages]);
          }
        }}
        removeClippedSubviews={true}
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
