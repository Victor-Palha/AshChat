defmodule ChatServiceWeb.ChatChannel do
  use Phoenix.Channel

  def join("chat:lobby", _message, socket) do
    {:ok, socket}
  end

  def handle_in("new_msg", %{"content" => content}, socket) do
    broadcast! socket, "new_msg", %{content: content}
    {:noreply, socket}
  end
end
