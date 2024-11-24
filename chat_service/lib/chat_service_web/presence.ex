defmodule ChatServiceWeb.Presence do
  use Phoenix.Presence,
    otp_app: :chat_service,
    pubsub_server: ChatService.PubSub
end
