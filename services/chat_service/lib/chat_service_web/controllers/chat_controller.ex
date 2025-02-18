defmodule ChatServiceWeb.ChatController do
  use ChatServiceWeb, :controller

  alias ChatService.Services.Chat
  alias ChatService.Services.User
  alias ChatService.Errors.{UserNotFoundError, ChatAlreadyExistsError, ContactAlreadyExistsError}

  # chat_id: chat.id.getValue,
  # messages: [],
  # nickname

  def create(conn, %{"receiver_tag" => receiver_tag}) do
    user_id = conn.assigns[:user_id]
    case Chat.create_chat(%{
      "sender_id" => user_id,
      "receiver_tag" => receiver_tag
    }) do
    {:ok, chat, sender, receiver} ->
      User.add_chat_to_user(sender.id, chat.id)
      User.add_chat_to_user(receiver.id, chat.id)

      User.add_contact_to_user(sender.id, receiver.id)
      User.add_contact_to_user(receiver.id, sender.id)
      conn
      |> put_status(:created)
      |> json(%{
          message: "Chat created successfully",
          chat_id: chat.id,
          messages: [],
          nickname: receiver.nickname,
          profile_picture: receiver.photo_url,
          description: receiver.description,
          preferred_language: receiver.preferred_language
        })
    {:error, %UserNotFoundError{}} ->
      conn
      |> put_status(:not_found)
      |> json(%{error: "User not found"})
    {:error, %ChatAlreadyExistsError{}} ->
      conn
      |> put_status(:conflict)
      |> json(%{error: "Chat already exists"})
    {:error, %ContactAlreadyExistsError{}} ->
      conn
      |> put_status(:conflict)
      |> json(%{error: "Contact already exists in user's contacts"})
    _ ->
      conn
      |> put_status(:internal_server_error)
      |> json(%{error: "An error occurred"})
    end
  end

  def get_chats(conn, _params) do
    user_id = conn.assigns[:user_id]
    case User.get_all_chats_from_user(user_id) do
      {:ok, chats} ->
        if chats == [] do
          conn
          |> put_status(:ok)
          |> json(%{chats: chats})
        else
          chats = Enum.map(chats, fn chat ->
            chat = Chat.get_chat_by_id(chat)
            receiver_id = Enum.find(chat.users_id, fn user -> user != user_id end)
            receiver =
              User.get_user_by_id(receiver_id)
              |> Map.delete(:_id)
              |> Map.delete(:device_token)
              |> Map.delete(:online)
              |> Map.delete(:chats_id)
              |> Map.delete(:contacts_id)
              |> Map.delete(:blocked_id)
              |> Map.delete(:notification_token)
              |> Map.from_struct()
            chat
            |> Map.from_struct()
            |> Map.update!(:_id, &BSON.ObjectId.encode!/1)
            |> Map.put(:receiver, receiver)
          end)
          conn
          |> put_status(:ok)
          |> json(%{chats: chats})
        end
      {:error, reason} ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: reason})
    end
  end
end
