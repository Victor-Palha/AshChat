import Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :chat_service, ChatServiceWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "bg2YfWwTEZL6DlBJPk1aCcVRwGoZ3U6OzUc090ZW2fhXOmzH/iAOGMCNznPoF1YC",
  server: false

# Print only warnings and errors during test
config :logger, level: :warning

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime
