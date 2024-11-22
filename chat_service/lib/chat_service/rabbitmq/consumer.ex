defmodule ChatService.Rabbitmq.Consumer do
  use GenServer

  alias AMQP.{Basic, Queue}
  alias ChatService.Rabbitmq.Connection

  @queue "chat_queue"

  def start_link(_) do
    GenServer.start_link(__MODULE__, nil, name: __MODULE__)
  end

  @impl true
  def init(_) do
    # Obtendo o canal do RabbitMQ
    case Connection.channel() do
      %AMQP.Channel{} = channel ->
        # Declarando a fila e iniciando o consumo de mensagens
        Queue.declare(channel, @queue, durable: true)
        Basic.consume(channel, @queue)
        {:ok, %{channel: channel}}

      other ->
        {:stop, {:invalid_channel, other}}
    end
  end

  # Lida com mensagens consumidas
  @impl true
  def handle_info({:basic_deliver, payload, _meta}, state) do
    process_message(payload)
    {:noreply, state}
  end

  # Confirmação de que o consumidor foi configurado com sucesso
  def handle_info({:basic_consume_ok, _info}, state) do
    IO.puts("Consumer successfully registered.")
    {:noreply, state}
  end

  # Notificação de cancelamento do consumidor
  def handle_info({:basic_cancel, _info}, state) do
    IO.puts("Consumer was canceled.")
    {:stop, :normal, state}
  end

  # Confirmação de cancelamento do consumidor
  def handle_info({:basic_cancel_ok, _info}, state) do
    IO.puts("Consumer cancellation confirmed.")
    {:noreply, state}
  end

  # Tratamento genérico para mensagens inesperadas
  def handle_info(message, state) do
    IO.puts("Unhandled message: #{inspect(message)}")
    {:noreply, state}
  end

  defp process_message(message) do
    IO.puts("Received message: #{message}")
    # Adicione aqui a lógica de processamento da mensagem
  end
end
