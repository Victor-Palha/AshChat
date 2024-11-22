defmodule ChatService.Repo do
  use Mongo.Repo, otp_app: :chat_service, topology: :mongo
end
