defmodule ChatServiceWeb.NotificationChannel do
  use Phoenix.Channel
  alias ChatService.PubsubNotification

  def join("notifications:" <> user_id, _payload, socket) do
    send(self(), :after_join)
    {:ok, assign(socket, :user_id, user_id)}
  end

  def handle_info(:after_join, socket) do
    user_id = socket.assigns.user_id
    # Pega as notificações pendentes
    notifications = PubsubNotification.get_notifications(user_id)

    # Envia todas as notificações pendentes para o cliente
    Enum.each(notifications, fn notification ->
      push(socket, "pending_notification", notification)
    end)

    {:noreply, socket}
  end

  def handle_info(notification, socket) do
    # Assumindo que notification já é um mapa contendo os dados da notificação
    push(socket, "new_notification", notification)
    {:noreply, socket}
  end
end
