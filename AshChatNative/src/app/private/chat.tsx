import { SocketContext } from "@/src/contexts/socketContext";
import { AddMessageProps, MessageProps } from "@/src/persistence/MMKVStorage";
import { colors } from "@/src/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
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
} from "react-native";

export default function Chat(): JSX.Element {
  const { chat_id, nickname } = useLocalSearchParams();
  const { ioServer, mmkvStorage, user_id } = useContext(SocketContext);

  // States
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");

  useEffect(() => {
    const chat = mmkvStorage.getChat(chat_id as string);
    if (!chat) {
      Alert.alert("Chat not found");
      router.back();
      return;
    }
    console.log("Chat found");
    setMessages(chat.messages);
  }, [chat_id, mmkvStorage]);

  useFocusEffect(
    useCallback(() => {
      ioServer.socket.emit("join-chat", { chat_id });
      mmkvStorage.updatingAllMessagesFromAChat(chat_id as string)
      return () => {
        ioServer.socket.emit("leave-chat", { chat_id });
      };
    }, [chat_id, ioServer.socket])
  );

  useEffect(() => {
    const handleReceiveMessage = ({ chat_id, content, sender_id }: AddMessageProps) => {
      const who = sender_id === user_id ? "user" : "contact";

      if (who === "contact") {
        console.log("Received message from contact");
        const newMessage = mmkvStorage.addMessage({
          chat_id,
          content,
          sender_id: who,
        }) as MessageProps;

        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    };

    const handleMessageSent = ({ chat_id, status, message_id }: any) => {
      mmkvStorage.updateMessageStatus({
        chat_id,
        id_message: message_id,
        status,
      });
    };

    ioServer.socket.on("receive-message", handleReceiveMessage);
    ioServer.socket.on("message-sent", handleMessageSent);

    return () => {
      ioServer.socket.off("receive-message", handleReceiveMessage);
      ioServer.socket.off("message-sent", handleMessageSent);
    };
  }, [ioServer.socket, mmkvStorage, user_id]);

  const handleCloseChat = () => {
    ioServer.socket.emit("close-chat", { chat_id });
    router.back();
  };

  const handleSend = () => {
    if (inputMessage.trim()) {
      ioServer.socket.emit("send-message", { chat_id, content: inputMessage });

      const newMessage = mmkvStorage.addMessage({
        chat_id: chat_id as string,
        content: inputMessage,
        sender_id: "user",
      }) as MessageProps;

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputMessage("");
    }
  };

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if(flatListRef.current) flatListRef.current.scrollToEnd({ animated: true });
  }, [messages]);

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
        <Text className="text-white font-bold text-2xl ml-3">{nickname}</Text>
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
