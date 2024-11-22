defmodule ChatServiceWeb.UserSocket do
  use Phoenix.Socket

  channel "chat:lobby", ChatServiceWeb.ChatChannel

  def connect(_params, socket) do
    IO.inspect(socket, label: "Connected socket")
    {:ok, socket}
  end

  def id(_socket), do: nil

end
