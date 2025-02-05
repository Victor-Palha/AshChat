defmodule ChatServiceWeb.ChatChannel do
  use Phoenix.Channel
  alias ChatServiceWeb.Presence
  alias ChatService.Models.Message, as: MessageModel
  alias ChatService.Services.Chat, as: ChatS
  alias ChatService.Services.User, as: UserS

  def join("chat:" <> chat_id, _payload, socket) do
    case ChatS.get_chat_by_id(chat_id) do
      nil -> {:error, %{reason: "chat_not_found"}}
      chat -> handle_chat_found(chat, socket, chat_id)
    end
  end

  defp handle_chat_found(chat, socket, chat_id) do
    receiver_id = Enum.find(chat.users_id, fn user_id -> user_id != socket.assigns.user_id end)
    send(self(), {:after_join})
    send(self(), {:receiver_info, receiver_id})

    socket
    |> assign(:receiver_id, receiver_id)
    |> assign(:chat_id, chat_id)
    |> assign(:participants, chat.users_id)
    |> assign(:same_language, chat.same_language)
    |> then(&{:ok, &1})
  end

  def handle_info({:receiver_info, receiver_id}, socket) do
    case UserS.get_user_by_id(receiver_id) do
      nil -> {:noreply, socket}
      user ->
        receiver_information = %{
          nickname: user.nickname,
          photo_url: user.photo_url,
          description: user.description,
          preferred_language: user.preferred_language,
          tag_user_id: user.tag_user_id
        }
        push(socket, "receiver_info", receiver_information)
        {:noreply, socket}
    end
  end
  def handle_info({:after_join}, socket) do
    track_presence(socket)
    ChatServiceWeb.Endpoint.subscribe("presence:lobby")
    receiver_id = socket.assigns.receiver_id
    notify_receiver_status(socket, receiver_id)
    {:noreply, socket}
  end
  def handle_info({:basic_consume_ok, _info}, socket), do: {:noreply, socket}
  def handle_info({:basic_cancel, _info}, socket), do: {:stop, :normal, socket}
  def handle_info({:basic_cancel_ok, _info}, socket), do: {:noreply, socket}
  def handle_info(%{event: "presence_diff", payload: payload}, socket) do
    receiver_id = socket.assigns.receiver_id

    # Verificar se o usuário entrou (online)
    if Map.has_key?(payload.joins, receiver_id) do
      push(socket, "receiver_online", %{status: true})
    end

    # Verificar se o usuário saiu (offline)
    if Map.has_key?(payload.leaves, receiver_id) do
      push(socket, "receiver_online", %{status: false})
    end

    {:noreply, socket}
  end

  defp track_presence(socket) do
    Presence.track(socket, "chat:" <> socket.assigns.chat_id, %{
      online_at: DateTime.utc_now() |> DateTime.to_iso8601()
    })
  end

  defp notify_receiver_status(socket, receiver_id) do
    online_users = Presence.list("presence:lobby")
    status = Map.has_key?(online_users, receiver_id)
    push(socket, "receiver_online", %{status: status})
  end

  def handle_in("typing", %{"is_typing" => is_typing}, socket) do
    broadcast_from(socket, "typing", %{
      is_typing: is_typing
    })
    {:noreply, socket}
  end

  def handle_in("send_message", %{"content" => content, "mobile_ref_id" => mobile_ref_id}, socket) do
    message = build_message(content, mobile_ref_id, socket)
    handle_message_delivery(message, socket)
    {:noreply, socket}
  end

  defp build_message(content, mobile_ref_id, socket) do
    sender_id = socket.assigns.user_id
    preferred_language_sender = socket.assigns.preferred_language
    same_language = socket.assigns.same_language
    recipient_id = socket.assigns.receiver_id

    %{preferred_language: preferred_language} = UserS.get_user_by_id(recipient_id)
    transformed_content = if !same_language, do: translate(content, preferred_language_sender, preferred_language), else: content

    %MessageModel{
      id: mobile_ref_id,
      sender_id: sender_id,
      content: content,
      translated_content: transformed_content,
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601(),
      status: "SENT"
    }
  end

  defp handle_message_delivery(message, socket) do
    chat_id = socket.assigns.chat_id
    recipient_id = socket.assigns.receiver_id
    user_ids_in_room = Presence.list("chat:" <> chat_id)

    if length(Map.get(user_ids_in_room, "chat:" <> chat_id)[:metas]) > 1 do
      updated_message = Map.put(message, :status, "READED")
      ChatS.add_message_to_chat(chat_id, updated_message)
      broadcast_message(socket, updated_message, chat_id)
      message_sent(socket, updated_message.status, updated_message.id, chat_id)
    else
      ChatS.add_message_to_chat(chat_id, message)
      notify_recipient(message, chat_id, recipient_id)
      message_sent(socket, message.status, message.id, chat_id)
    end
  end

  defp broadcast_message(socket, message, chat_id) do
    broadcast_from(socket, "receive_message", %{
      chat_id: chat_id,
      content: message.translated_content,
      sender_id: message.sender_id
    })
  end

  defp notify_recipient(message, chat_id, recipient_id) do
    ChatService.PubsubNotification.add_notification(recipient_id, %{
      chat_id: chat_id,
      sender_id: message.sender_id,
      content: message.translated_content,
      timestamp: message.timestamp
    })
  end

  defp message_sent(socket, status, message_id, chat_id) do
    push(socket, "message_sent", %{
      mobile_ref_id: message_id,
      status: status,
      chat_id: chat_id
    })
  end

  defp translate(content, source_language, target_language) do
    source_language = if is_binary(source_language), do: String.downcase(source_language), else: "en"
    target_language = if is_binary(target_language), do: String.downcase(target_language), else: "en"

    case ChatService.Rabbitmq.Translator.rpc_translate(content, source_language, target_language) do
      {:ok, %{"translated_text" => translated_text}} -> translated_text
      {:error, reason} ->
        IO.puts("Erro durante a tradução: #{reason}")
        content
    end
  end
end
