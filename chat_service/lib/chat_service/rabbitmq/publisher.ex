defmodule ChatService.Rabbitmq.Publisher do
  alias AMQP.Basic

  @exchange "chat_exchange"

  def publish_message(queue, message) do
    with channel <- ChatService.Rabbitmq.Connection.channel(),
         :ok <- Basic.publish(channel, @exchange, queue, message) do
      :ok
    else
      error -> {:error, error}
    end
  end
end
