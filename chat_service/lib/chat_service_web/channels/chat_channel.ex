defmodule ChatServiceWeb.ChatChannel do
  use Phoenix.Channel
  alias ChatServiceWeb.Presence
  alias ChatService.Models.Message, as: MessageModel
  alias ChatService.Services.Chat, as: ChatS

  # Entrando no canal de chat
  def join("chat:" <> chat_id, _payload, socket) do
    result = Task.async(fn -> ChatS.get_chat_by_id(chat_id) end) |> Task.await()

    case result do
      nil ->
        {:error, %{reason: "chat_not_found"}}

      chat ->
        send(self(), :after_join)

        socket
        |> assign(:chat_id, chat_id)
        |> assign(:same_language, chat.same_language)
        |> then(&{:ok, &1})
    end
  end

  # Após o join, marca a presença do usuário no canal
  def handle_info(:after_join, socket) do
    Presence.track(socket, socket.assigns.user_id, %{
      online_at: inspect(System.system_time(:second))
    })

    # Envia a lista de presença para o socket
    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  def handle_info({:basic_consume_ok, _info}, socket) do
    {:noreply, socket}
  end

  # Recebe a mensagem, realiza a tradução e transmite para os outros participantes
  def handle_in("send_message", %{"content" => content, "mobile_ref_id" => mobile_ref_id}, socket) do
    sender_id = socket.assigns.user_id
    chat_id = socket.assigns.chat_id

    # Traduz o conteúdo
    translated_content = translated_content(content)
    IO.inspect(translated_content, label: "translated_content")

    # Cria o modelo de mensagem
    message = %MessageModel{
      id: mobile_ref_id,
      sender_id: sender_id,
      content: content,
      translated_content: translated_content,
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601(),
      status: "SENT"
    }

    IO.inspect(message, label: "message")

    # Aqui você pode salvar a mensagem no banco de dados, se necessário
    ChatS.add_message_to_chat(chat_id, message)

    # Transmite a mensagem para todos no chat
    broadcast_from(socket, "receive_message", %{
      chat_id: chat_id,
      content: content,
      sender_id: sender_id
    })

    # Envia um status de envio para o remetente
    push(socket, "message_sent", %{
      mobile_ref_id: mobile_ref_id,
      status: "SENT",
      chat_id: chat_id
    })

    {:noreply, socket}
  end

  # Função de tradução que chama o RabbitMQ
  def translated_content(content) do
    source_language = "en"
    target_language = "es"

    case ChatService.Rabbitmq.Translator.rpc_translate(content, source_language, target_language) do
      {:ok, %{"translated_text" => translated_text}} ->
        translated_text

      {:error, reason} ->
        # Logando o erro e retornando o conteúdo original
        IO.puts("Erro durante a tradução: #{reason}")
        content
    end
  end
end
