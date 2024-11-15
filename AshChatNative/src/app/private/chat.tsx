import { colors } from "@/src/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

export default function Chat(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Olá! Como posso te ajudar hoje?", sender: "bot" },
    { id: "2", text: "Oi! Gostaria de saber mais sobre o serviço.", sender: "user" },
  ]);
  const [inputMessage, setInputMessage] = useState<string>("");

  const handleSend = (): void => {
    if (inputMessage.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now().toString(), text: inputMessage, sender: "user" },
      ]);
      setInputMessage("");
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      className={`my-2 p-3 rounded-lg ${
        item.sender === "user"
          ? "bg-blue-500 self-end"
          : "bg-gray-200 self-start"
      }`}
    >
      <Text className={item.sender === "user" ? "text-white" : "text-gray-800"}>
        {item.text}
      </Text>
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
        <TouchableOpacity onPress={()=>router.back()}>
          <MaterialIcons name="keyboard-arrow-left" size={34} color={colors.purple[700]} />
        </TouchableOpacity>
        <Text className="text-white font-bold text-2xl ml-3">Jane Doe</Text>
      </View>

      {/* Lista de Mensagens */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        className="flex-1 px-4 py-2"
        contentContainerStyle={{ justifyContent: "flex-end" }}
      />

      {/* Campo de Entrada */}
      <View className="flex-row items-center border-gray-900 p-3 pb-12">
        <TextInput
          className="flex-1 bg-gray-200 rounded-full px-4 py-2 text-gray-800"
          placeholder="Digite sua mensagem..."
          value={inputMessage}
          onChangeText={setInputMessage}
          keyboardType="default"
        />
        <TouchableOpacity
          className="ml-2 bg-blue-500 rounded-full p-3"
          onPress={handleSend}
        >
          <Text className="text-white font-bold">Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
