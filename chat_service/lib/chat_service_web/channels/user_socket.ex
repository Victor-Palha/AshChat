defmodule ChatServiceWeb.UserSocket do
  use Phoenix.Socket
  require Logger

  channel "chat:*", ChatServiceWeb.ChatChannel
  channel "notifications:*", ChatServiceWeb.NotificationChannel

  def connect(%{"token" => token, "device_unique_id" => device_unique_id, "preferred_language" => preferred_language}, socket, _connect_info) do
    with {:ok, claims} <- ChatService.Auth.verify_token(token),
         user_id <- claims["sub"],
         {:ok, _} <- ChatService.Auth.verify_device_token(user_id, device_unique_id) do
      Logger.info("Connected socket for user #{user_id}")

      socket = assign(socket, :user_id, user_id) |> assign(:preferred_language, preferred_language)
      {:ok, socket}
    else
      _ -> {:error, :unauthorized}
    end
  end

  def id(socket) do
    "user_socket:#{socket.assigns[:user_id]}"
  end

  def handle_disconnect(%{id: "user_socket:" <> user_id}) do
    Logger.info("Disconnected socket for user #{user_id}")
    :ok
  end
end
