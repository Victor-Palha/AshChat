defmodule ChatServiceWeb.PresenceChannel do
  use Phoenix.Channel
  alias ChatServiceWeb.Presence

  def join("presence:lobby", _params, socket) do
    user_id = socket.assigns[:user_id]

    # Rastrear o usuário no Phoenix Presence
    Presence.track(
      self(),                # Processo do usuário
      "presence:lobby",      # Tópico do canal
      user_id,               # ID único do usuário
      %{
        online_at: :os.system_time(:millisecond)
      }
    )

    {:ok, socket}
  end
end
