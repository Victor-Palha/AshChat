defmodule ChatServiceWeb.ChatChannel do
  use Phoenix.Channel
  alias ChatServiceWeb.Presence, as: Presence
  alias ChatService.Models.Message, as: MessageModel
  alias ChatService.Services.Chat, as: ChatService

  def join("chat:" <> chat_id, _payload, socket) do
    result = Task.async(fn -> ChatService.get_chat_by_id(chat_id) end) |> Task.await()
    case result do
      nil ->
        {:error, %{reason: "chat_not_found"}}

      chat ->
        send(self(), :after_join)
        IO.inspect(chat, label: "chat")

        socket
        |> assign(:chat_id, chat_id)
        |> assign(:same_language, chat.same_language)
        |> then(&{:ok, &1})
    end
  end

  def handle_info(:after_join, socket) do
    Presence.track(socket, socket.assigns.user_id, %{
      online_at: inspect(System.system_time(:second))
    })
    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  def handle_in("send_message", %{"content" => content, "mobile_ref_id" => mobile_ref_id}, socket) do
    IO.inspect(socket, label: "socket")
    _users_using_same_language = socket.assigns.same_language
    sender_id = socket.assigns.user_id
    chat_id = socket.assigns.chat_id

    message = %MessageModel{
      id: mobile_ref_id,
      sender_id: sender_id,
      content: content,
      translated_content: content,
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601(),
      status: "SENT",
    }

    ChatService.add_message_to_chat(chat_id, message)

    broadcast_from(socket, "receive_message", %{
      chat_id: chat_id,
      content: content,
      sender_id: sender_id,
    })

    push(socket, "message_sent", %{
      mobile_ref_id: mobile_ref_id,
      status: "SENT",
      chat_id: chat_id,
    })

    {:noreply, socket}
  end
end
