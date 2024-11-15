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
      className="flex-1 bg-gray-100"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      {/* Lista de Mensagens */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        className="flex-1 px-4 py-2"
        contentContainerStyle={{ justifyContent: "flex-end" }}
      />

      {/* Campo de Entrada */}
      <View className="flex-row items-center bg-white border-t border-gray-300 p-3">
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
