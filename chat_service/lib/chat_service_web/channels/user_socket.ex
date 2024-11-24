defmodule ChatServiceWeb.UserSocket do
  use Phoenix.Socket

  channel "chat:*", ChatServiceWeb.ChatChannel

  def connect(%{"token" => token, "device_unique_id" => _device_unique_id}, socket, _connect_info) do
    case ChatService.Auth.verify_token(token) do
      {:ok, claims} ->
        {:ok, assign(socket, :user_id, claims["sub"])}
      {:error, _reason} ->
        :error
    end
  end

  def id(socket) do
    "user_socket:#{socket.assigns[:user_id]}"
  end
end
