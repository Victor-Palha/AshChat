defmodule ChatService.Rabbitmq.ConsumerStarter do
  use GenServer

  require Logger

  def start_link(_) do
    GenServer.start_link(__MODULE__, nil, name: __MODULE__)
  end

  @impl true
  def init(_) do
    # Espera até o canal estar disponível
    channel = ChatService.Rabbitmq.Connection.channel()

    # Quando o canal estiver disponível, inicia o consumidor
    start_consumer(channel)
    {:ok, %{}}
  end

  defp start_consumer(channel) do
    # Inicializa o consumidor com o canal e a fila
    queue = "confirm_new_account_queue"
    handler = ChatService.Handlers.QueueConfirmNewAccount

    # Inicia o GenericConsumer com as configurações corretas
    {:ok, _pid} = ChatService.Rabbitmq.GenericConsumer.start_link(%{channel: channel, queue: queue, handler: handler})
    Logger.info("Consumer started for queue #{queue}")
  end
end
