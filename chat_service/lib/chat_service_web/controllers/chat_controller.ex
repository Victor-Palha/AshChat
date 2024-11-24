defmodule ChatServiceWeb.ChatController do
  use ChatServiceWeb, :controller

  alias ChatService.Services.Chat
  alias ChatService.Errors.{UserNotFoundError, ChatAlreadyExistsError}

  def create(conn, %{"receiver_tag" => receiver_tag}) do
    user_id = conn.assigns[:user_id]
    case Chat.create_chat(%{
      "sender_id" => user_id,
      "receiver_tag" => receiver_tag
    }) do
    {:ok, chat} -> json(conn, %{message: "Chat created successfully", chat: chat})
    {:error, %UserNotFoundError{}} ->
      conn
      |> put_status(:not_found)
      |> json(%{error: "User not found"})
    {:error, %ChatAlreadyExistsError{}} ->
      conn
      |> put_status(:conflict)
      |> json(%{error: "Chat already exists"})
    _ ->
      conn
      |> put_status(:internal_server_error)
      |> json(%{error: "An error occurred"})
    end
  end
end
