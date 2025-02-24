import { useEffect, useRef } from "react";
import { ChatViewModel } from "./chat-view-model";
import { LoadMessages } from "./LoadMessages";

type ChatProps = {
  chat_id: string;
  nickname: string;
};

export function Chat({ chat_id, nickname }: ChatProps) {
  const {
    profilePicture,
    modalDescriptionProps,
    isModalDescriptionOpen,
    isReceiverOnline,
    messages,
    isUserTyping,
    inputMessage,
    handleGetOlderMessages,
    handleCloseChat,
    handleOpenAndCloseModalDescription,
    handleWriteMessage,
    handleSendMessage,
    handleGroupMessages,
    handleNormalizeDate,
  } = ChatViewModel({ chat_id });

  const groupedMessages = handleGroupMessages(messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Rolar para o final da lista de mensagens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(()=>{
    scrollToBottom();
  }, [messages])

  return (
    <div className="flex flex-col h-screen bg-gray-700">
      {/* Header */}
      <div className="flex flex-row border-b border-purple-700 p-3 items-center bg-gray-800">
        <button
          className="flex flex-row items-center ml-3"
          onClick={handleOpenAndCloseModalDescription}
        >
          {profilePicture && (
            <img
              src={profilePicture}
              alt="Profile"
              className="w-12 h-12 rounded-full"
            />
          )}
          <span className="text-white font-bold text-xl ml-3">{nickname}</span>
          {/* Online? */}
          {isReceiverOnline ? (
            <span className="w-2 h-2 bg-green-500 rounded-full ml-2"></span>
          ) : (
            <span className="w-2 h-2 bg-red-500 rounded-full ml-2"></span>
          )}
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {groupedMessages.map((item, index) => {
          // A última mensagem do grupo anterior (ou undefined se for a primeira mensagem)
          const lastMessageDate = index > 0 ? handleNormalizeDate(groupedMessages[index - 1].timestamp.toISOString()) : undefined;
          return (
            <LoadMessages
              key={item.id}
              item={item}
              lastMessageDate={lastMessageDate}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {isUserTyping && (
        <div className="px-4 pb-2">
          <span className="text-purple-400 text-sm font-medium">Typing...</span>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-gray-900 p-3 pb-5">
        <form
            className="bg-gray-200 rounded-md flex flex-row items-center"
            onSubmit={(e) => { handleSendMessage(e) }}
        >
          <textarea
              className="flex-1 rounded-md bg-gray-200 px-4 py-2 text-gray-800 outline-none resize-none max-h-40 overflow-y-auto"
              placeholder="Message..."
              value={inputMessage}
              onChange={(e) => handleWriteMessage(e.target.value)}
              onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      e.currentTarget.form?.requestSubmit();
                  }
              }}
              style={{ width: '100%' }}
          />
        </form>
      </div>
    </div>
  );
}
