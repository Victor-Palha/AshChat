defmodule ChatService.Handlers.QueueAHandler do
  require Logger

  def handle_message(payload, _meta) do
    Logger.info("Processing message for Queue A: #{payload}")
    # Processa a mensagem aqui
  end
end
