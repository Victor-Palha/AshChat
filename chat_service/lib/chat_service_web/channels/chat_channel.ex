defmodule ChatServiceWeb.ChatChannel do
  use Phoenix.Channel
  alias ChatServiceWeb.Presence
  alias ChatService.Models.Message, as: MessageModel
  alias ChatService.Services.Chat, as: ChatS
  alias ChatService.Services.User, as: UserS

  # Entrando no canal de chat
  def join("chat:" <> chat_id, _payload, socket) do
    result = Task.async(fn -> ChatS.get_chat_by_id(chat_id) end) |> Task.await()

    case result do
      nil ->
        {:error, %{reason: "chat_not_found"}}

      chat ->
        send(self(), :after_join)

        socket
        |> assign(:chat_id, chat_id)
        |> assign(:participants, chat.users_id)
        |> assign(:same_language, chat.same_language)
        |> then(&{:ok, &1})
    end
  end

  # Após o join, marca a presença do usuário no canal
  def handle_info(:after_join, socket) do
    Presence.track(socket, socket.assigns.user_id, %{
      online_at: inspect(System.system_time(:second))
    })

    # Envia a lista de presença para o socket
    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  def handle_info({:basic_consume_ok, _info}, socket) do
    {:noreply, socket}
  end

  def handle_info({:basic_cancel, _info}, socket) do
    {:stop, :normal, socket}
  end

  def handle_info({:basic_cancel_ok, _info}, socket) do
    {:noreply, socket}
  end

  def handle_in("send_message", %{"content" => content, "mobile_ref_id" => mobile_ref_id}, socket) do
    sender_id = socket.assigns.user_id
    chat_id = socket.assigns.chat_id
    participants = socket.assigns.participants
    preferred_language_sender = socket.assigns.preferred_language
    same_language = socket.assigns.same_language

    recipient_id = Enum.find(participants, fn user_id -> user_id != sender_id end)

    %{preferred_language} = UserS.get_user_by_id(recipient_id)

    transformed_content = content
    if same_language == false do
      transformed_content = translated_content(content, preferred_language_sender, preferred_language)
    end

    message = %MessageModel{
      id: mobile_ref_id,
      sender_id: sender_id,
      content: content,
      translated_content: transformed_content,
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601(),
      status: "SENT"
    }

    user_ids_in_room = Presence.list(socket) |> Map.keys()

    if recipient_id in user_ids_in_room do
      updated_message = Map.put(message, :status, "READED")
      ChatS.add_message_to_chat(chat_id, message)

      broadcast_from(socket, "receive_message", %{
        chat_id: chat_id,
        content: translated_content,
        sender_id: sender_id
      })

      push(socket, "message_sent", %{
        mobile_ref_id: mobile_ref_id,
        status: updated_message.status,
        chat_id: chat_id
      })
    else
      ChatS.add_message_to_chat(chat_id, message)
      ChatService.PubsubNotification.add_notification(recipient_id, %{
        chat_id: chat_id,
        sender_id: sender_id,
        content: translated_content,
        timestamp: message.timestamp
      })

      push(socket, "message_sent", %{
        mobile_ref_id: mobile_ref_id,
        status: message.status,
        chat_id: chat_id
      })
    end

    {:noreply, socket}
  end

  # Função de tradução que chama o RabbitMQ
  def translated_content(content, source_language, target_language) do
    source_language = source_language || "en"
    target_language = target_language || "en"

    case ChatService.Rabbitmq.Translator.rpc_translate(content, source_language, target_language) do
      {:ok, %{"translated_text" => translated_text}} ->
        translated_text

      {:error, reason} ->
        # Logando o erro e retornando o conteúdo original
        IO.puts("Erro durante a tradução: #{reason}")
        content
    end
  end
end
