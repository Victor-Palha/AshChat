# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :chat_service,
  generators: [timestamp_type: :utc_datetime]

# Configures the endpoint
config :chat_service, ChatServiceWeb.Endpoint,
  url: [host: {0,0,0,0}],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [json: ChatServiceWeb.ErrorJSON],
    layout: false,
    accepts: ~w(json)
  ],
  json_encoder: Jason,
  pubsub_server: ChatService.PubSub,
  live_view: [signing_salt: "oorrvuVO"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :joken,
  rs256: [
    signer_alg: "RS256",
    key_pem: File.read!("priv/keys/public_key.pem")
  ]

# config :chat_service, :phoenix_swagger,
#   swagger_files: %{
#     "priv/static/swagger.json" => ChatServiceWeb.SwaggerSchema
#   }

config :phoenix_swagger, json_library: Jason

config :chat_service, :phoenix_swagger,
  swagger_files: %{
    "priv/static/swagger.json" => [
      router: ChatServiceWeb.Router,
    ]
  }

config :chat_service, :rabbitmq,
host: System.get_env("PHX_RABBITMQ_HOST") || "localhost",
username: System.get_env("PHX_RABBITMQ_USER") || "root",
password: System.get_env("PHX_RABBITMQ_PASSWORD") || "randompassword",
port: 5672,
virtual_host: "/"

# # Configurações do MongoDB
config :chat_service, ChatService.Repo,
url: System.get_env("PHX_MONGODB_URI") || "mongodb://root:example@localhost:27017/chats?authSource=admin",
timeout: 60_000,
idle_interval: 10_000,
queue_target: 5_000,
pool_size: 10

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
