defmodule ChatServiceWeb.UserSocket do
  use Phoenix.Socket

  channel "chats:*", ChatServiceWeb.ChatChannel

  def connect(%{"token" => token, "device_unique_id" => device_unique_id}, socket, _connect_info) do
    IO.inspect(socket, label: "Connected socket")
    IO.inspect(token, label: "Token")
    IO.inspect(device_unique_id, label: "Device unique id")
    {:ok, socket}
  end

  def id(_socket), do: nil

end
