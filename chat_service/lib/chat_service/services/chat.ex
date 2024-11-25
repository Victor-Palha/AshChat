defmodule ChatService.Services.Chat do
  alias ChatService.Models.Chat, as: ChatModel
  alias ChatService.Services.User, as: UserService
  alias ChatService.Repo, as: Repo

  def create_chat(%{
    "sender_id" => sender_id,
    "receiver_tag" => receiver_tag,
  }) do

    sender = UserService.get_user_by_id(sender_id)
    receiver = UserService.get_user_by_tag(receiver_tag)

    unless sender && receiver do
      raise ChatService.Errors.UserNotFoundError
    end

    chat_already_exists = Repo.exists?(ChatModel, %{
      users_id: [sender.id, receiver.id]
    })

    if chat_already_exists do
      raise ChatService.Errors.ChatAlreadyExistsError
    end


    {:ok, chat} = ChatModel.new(%{
      users_id: [sender.id, receiver.id],
      same_language: sender.preferred_language == receiver.preferred_language
    }) |> Repo.insert()

    {:ok, chat, sender, receiver}

    rescue
      e in [ChatService.Errors.UserNotFoundError, ChatService.Errors.ChatAlreadyExistsError] ->
        {:error, e}
      e in Mongo.Error ->
        {:error, e}
  end

  def get_chat_by_id(chat_id) do
    chat_id = BSON.ObjectId.decode!(chat_id)
    Repo.get(ChatModel, chat_id)
  end

  def add_message_to_chat(chat_id, message) do
    chat = get_chat_by_id(chat_id)
    if chat == nil do
      raise ChatService.Errors.ChatNotFoundError
    end

    new_message = ChatService.Models.Message.to_map(message)

    case Mongo.update_one(:mongo, "chats", %{"_id" => BSON.ObjectId.decode!(chat_id)}, %{"$push" => %{"messages" => new_message}}) do
      {:ok, _result} ->
        {:ok, "Message added successfully"}

      {:error, reason} ->
        {:error, reason}
    end
  end

end
