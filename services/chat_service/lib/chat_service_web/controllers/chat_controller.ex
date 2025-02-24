defmodule ChatServiceWeb.ChatController do
  use ChatServiceWeb, :controller
  use PhoenixSwagger

  alias ChatServiceWeb.CommonParameters
  alias ChatService.Services.Chat
  alias ChatService.Services.User
  alias ChatService.Errors.{UserNotFoundError, ChatAlreadyExistsError, ContactAlreadyExistsError}

  swagger_path :create do
    post("/api/chat")
    summary("Creates a new chat")
    description("Creates a new chat between two users based on the receiver_tag.")
    produces(["application/json"])
    consumes(["application/json"])
    security [%{jwtAuth: []}, %{deviceTokenAuth: []}]
    CommonParameters.authorization

    parameters do
      receiver_tag(:body, :string, "Receiver user's tag", required: true, example: "ash_chat_17280273")
    end

    response 201, "Chat successfully created",
    %{ example: %{
          "message" => "Chat created successfully",
          "chat_id" => "507f1f77bcf86cd799439011",
          "messages" => [],
          "nickname" => "Jane Doe",
          "profile_picture" => "https://static.victor-palha.com/default.png",
          "description" => "Hey I'm using AshChat :)",
          "preferred_language" => "en"
      }
    }

    response 404, "User not found", %{ example: %{ "error" => "User not found" } }

    response 409, "Conflict",
    %{ example: %{ "error" => "Chat already exists or contact is already in user's contacts" } }

    response 500, "Internal error", %{ example: %{ "error" => "Internal Server Error" } }
  end
  def create(conn, %{"receiver_tag" => receiver_tag}) do
    user_id = conn.assigns[:user_id]
    case Chat.create_chat(%{"sender_id" => user_id, "receiver_tag" => receiver_tag}) do
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
        conn |> put_status(:not_found) |> json(%{error: "User not found"})
      {:error, %ChatAlreadyExistsError{}} ->
        conn |> put_status(:conflict) |> json(%{error: "Chat already exists"})
      {:error, %ContactAlreadyExistsError{}} ->
        conn |> put_status(:conflict) |> json(%{error: "Contact already exists in user's contacts"})
      _ ->
        conn |> put_status(:internal_server_error) |> json(%{error: "An error occurred"})
    end
  end

  swagger_path :get_chats do
    get("/api/chat")
    summary("Retrieves all chats of a user")
    description("Returns all chats associated with the authenticated user.")
    produces(["application/json"])
    security [%{jwtAuth: []}, %{deviceTokenAuth: []}]
    CommonParameters.authorization

    response 200, "List of chats",
    %{ example: %{
          "chats" => [
            %{
              "id" => "507f1f77bcf86cd799439011",
              "messages" => [
                %{
                  "content" => "Hello there",
                  "id" => "1",
                  "sender_id" => "2",
                  "status" => "sent",
                  "timestamp" => "2025-02-24T15:00:00Z",
                  "translated_content" => "Olá"
                }
              ],
              "receiver" => %{
                "id" => "3",
                "description" => "Friend",
                "preferred_language" => "en",
                "nickname" => "Jane Doe",
                "photo_url" => "https://static.victor-palha.com/default.png",
                "tag_user_id" => "ash_chat_17280273"
              },
              "same_language" => true
            }
          ]
      }
    }

    response 500, "Internal error", %{ example: %{ "error" => "Internal Server Error" } }
  end
  def get_chats(conn, _params) do
    user_id = conn.assigns[:user_id]
    case User.get_all_chats_from_user(user_id) do
      {:ok, chats} ->
        if chats == [] do
          conn |> put_status(:ok) |> json(%{chats: chats})
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
          conn |> put_status(:ok) |> json(%{chats: chats})
        end
      {:error, reason} ->
        conn |> put_status(:internal_server_error) |> json(%{error: reason})
    end
  end
end
