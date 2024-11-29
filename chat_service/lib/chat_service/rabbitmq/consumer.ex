defmodule ChatService.Rabbitmq.GenericConsumer do
  use GenServer

  require Logger

  def start_link(%{channel: channel, queue: queue, handler: handler}) do
    GenServer.start_link(__MODULE__, %{channel: channel, queue: queue, handler: handler})
  end

  @impl true
  def init(%{channel: channel, queue: queue, handler: handler}) do
    # Inscrição na fila
    AMQP.Basic.consume(channel, queue)

    {:ok, %{channel: channel, queue: queue, handler: handler}}
  end

  @impl true
  def handle_info({:basic_deliver, payload, meta}, %{channel: channel, handler: handler} = state) do
    Logger.info("Message received from #{state.queue}: #{inspect(payload)}")

    # Processa a mensagem usando o handler fornecido
    case Jason.decode(payload) do
      {:ok, msg} ->
        apply(handler, :handle_message, [msg, meta])
        AMQP.Basic.ack(channel, meta.delivery_tag)
        {:noreply, state}

      {:error, reason} ->
        Logger.error("Failed to decode message: #{inspect(payload)}, reason: #{inspect(reason)}")
        {:noreply, state}
    end
  end

  def handle_info({:basic_consume_ok, _info}, state) do
    Logger.info("Consumer registered for queue #{state.queue}")
    {:noreply, state}
  end

  def handle_info({:basic_cancel, _info}, state) do
    Logger.info("Consumer cancelled for queue #{state.queue}")
    {:stop, :normal, state}
  end

  def handle_info({:basic_cancel_ok, _info}, state) do
    Logger.info("Consumer cancellation acknowledged for queue #{state.queue}")
    {:noreply, state}
  end
end
