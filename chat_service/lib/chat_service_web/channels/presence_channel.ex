defmodule ChatServiceWeb.PresenceChannel do
  use Phoenix.Channel
  alias ChatServiceWeb.Presence

  def join("presence:lobby", _params, socket) do
    user_id = socket.assigns[:user_id]

    Presence.track(
      self(),
      "presence:lobby",
      user_id,
      %{
        online_at: :os.system_time(:millisecond)
      }
    )

    {:ok, socket}
  end
end
