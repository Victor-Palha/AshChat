defmodule ChatService.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      ChatServiceWeb.Telemetry,
      {DNSCluster, query: Application.get_env(:chat_service, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: ChatService.PubSub},
      {ChatService.PubsubNotification, []},
      {Mongo, ChatService.Repo.config()},
      {ChatService.Rabbitmq.Connection, []},
      # Adiciona o GenServer para conectar-se ao RabbitMQ e obter o canal
      {ChatService.Rabbitmq.ConsumerStarter, []},
      # Start a worker by calling: ChatService.Worker.start_link(arg)
      # {ChatService.Worker, arg},
      ChatServiceWeb.Presence,
      # Start to serve requests, typically the last entry
      ChatServiceWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: ChatService.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    ChatServiceWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
