defmodule ChatServiceWeb.UserSocket do
  use Phoenix.Socket
  require Logger

  channel "chat:*", ChatServiceWeb.ChatChannel
  channel "notifications:*", ChatServiceWeb.NotificationChannel

  def connect(%{"token" => token, "device_unique_id" => _device_unique_id}, socket, _connect_info) do
    case ChatService.Auth.verify_token(token) do
      {:ok, claims} ->
        user_id = claims["sub"]
        {:ok, assign(socket, :user_id, user_id)}
      {:error, _reason} ->
        :error
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
