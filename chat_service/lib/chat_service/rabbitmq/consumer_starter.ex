defmodule ChatService.Rabbitmq.ConsumerStarter do
  use GenServer

  require Logger

  def start_link(_) do
    GenServer.start_link(__MODULE__, nil, name: __MODULE__)
  end

  @impl true
  def init(_) do
    channel = ChatService.Rabbitmq.Connection.channel()

    ensure_queue_exists(channel, "confirm_new_account_queue")

    start_consumer(channel)

    {:ok, %{}}
  end

  defp ensure_queue_exists(channel, queue) do
    case AMQP.Queue.declare(channel, queue, durable: true) do
      {:ok, _} ->
        Logger.info("Queue #{queue} is ready.")
      {:error, reason} ->
        Logger.error("Failed to declare queue #{queue}: #{inspect(reason)}")
        raise "Failed to declare queue"
    end
  end

  defp start_consumer(channel) do
    queue = "confirm_new_account_queue"
    handler = ChatService.Handlers.QueueConfirmNewAccount

    {:ok, _pid} = ChatService.Rabbitmq.GenericConsumer.start_link(%{channel: channel, queue: queue, handler: handler})
    Logger.info("Consumer started for queue #{queue}")
  end
end
