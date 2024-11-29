defmodule ChatService.PubsubNotification do
  use GenServer
  alias Phoenix.PubSub

  @pubsub_name ChatService.PubSub  # Nome do seu PubSub

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  def add_notification(user_id, notification) do
    GenServer.cast(__MODULE__, {:add_notification, user_id, notification})
  end

  def get_notifications(user_id) do
    GenServer.call(__MODULE__, {:get_notifications, user_id})
  end

  # GenServer Callbacks
  def init(_) do
    {:ok, %{}}
  end

  def handle_cast({:add_notification, user_id, notification}, state) do
    updated_state =
      Map.update(state, user_id, [notification], fn notifications ->
        [notification | notifications]
      end)

    # Publica a notificação no tópico específico
    topic = "notifications:#{user_id}"
    PubSub.broadcast(@pubsub_name, topic, notification)

    {:noreply, updated_state}
  end

  def handle_call({:get_notifications, user_id}, _from, state) do
    notifications = Map.get(state, user_id, [])
    updated_state = Map.delete(state, user_id)
    {:reply, notifications, updated_state}
  end
end
