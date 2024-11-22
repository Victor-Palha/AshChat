defmodule ChatService.Rabbitmq.Connection do
  use GenServer

  require Logger

  alias AMQP.{Channel, Connection}

  @config Application.compile_env(:chat_service, :rabbitmq)

  def start_link(_) do
    GenServer.start_link(__MODULE__, nil, name: __MODULE__)
  end

  @impl true
  def init(_) do
    case connect() do
      {:ok, conn, chan} -> {:ok, %{connection: conn, channel: chan}}
      {:error, reason} ->
        Logger.error("Failed to connect to RabbitMQ: #{inspect(reason)}")
        {:stop, reason}
    end
  end

  defp connect() do
    case Connection.open(@config) do
      {:ok, conn} ->
        case Channel.open(conn) do
          {:ok, chan} ->
            Logger.info("Connected to RabbitMQ")
            IO.inspect(chan)
            {:ok, conn, chan}
          error ->
            Logger.error("Failed to open channel: #{inspect(error)}")
            {:error, error}
        end
      error ->
        Logger.error("Failed to connect to RabbitMQ: #{inspect(error)}")
        {:error, error}
    end
  end

  @impl true
  def terminate(_reason, %{connection: conn, channel: chan}) do
    Channel.close(chan)
    Connection.close(conn)
    Logger.info("Disconnected from RabbitMQ")
  end

  def channel() do
    GenServer.call(__MODULE__, :get_channel)
  end

  @impl true
  def handle_call(:get_channel, _from, %{channel: chan} = state) do
    {:reply, chan, state}
  end
end
