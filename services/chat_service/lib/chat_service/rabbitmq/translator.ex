defmodule ChatService.Rabbitmq.Translator do
  alias ChatService.Rabbitmq.Connection

  @queue_input "translate_queue_input"

  @spec rpc_translate(String.t(), String.t(), String.t()) :: {:ok, map()} | {:error, String.t()}
  def rpc_translate(text, source_language, target_language) do
    channel = Connection.channel()

    correlation_id = :rand.uniform() |> Float.to_string() |> String.replace(".", "")
    reply_queue = "reply_#{correlation_id}"
    AMQP.Queue.declare(channel, reply_queue, exclusive: true)

    message = %{
      "text" => text,
      "source_language" => source_language,
      "target_language" => target_language
    }

    AMQP.Basic.publish(
      channel,
      "",
      @queue_input,
      Jason.encode!(message),
      reply_to: reply_queue,
      correlation_id: correlation_id
    )

    receive_response(channel, reply_queue, correlation_id)
  end

  defp receive_response(channel, queue, correlation_id) do
    AMQP.Basic.consume(channel, queue)

    receive do
      {:basic_deliver, payload, %{correlation_id: ^correlation_id}} ->
        case Jason.decode(payload) do
          {:ok, response} -> {:ok, response}
          {:error, reason} -> {:error, "Failed to parse response: #{inspect(reason)}"}
        end
    after
      5000 -> {:error, "Translation timeout"}
    end
  end
end
