defmodule ChatService.Services.Chat do
  alias ChatService.Models.Chat, as: Chat
  alias ChatService.Services.User, as: User
  alias ChatService.Repo, as: Repo

  @spec create_chat(map()) ::
          {:error, map()}
          | {:ok, %{:_id => nil | BSON.ObjectId.t(), optional(any()) => any()}, any(), any()}
  def create_chat(%{
    "sender_id" => sender_id,
    "receiver_tag" => receiver_tag,
  }) do

    sender = User.get_user_by_id(sender_id)
    receiver = User.get_user_by_tag(receiver_tag)

    unless sender && receiver do
      raise ChatService.Errors.UserNotFoundError
    end

    chat_already_exists = Repo.exists?(Chat, %{
      users_id: [sender.id, receiver.id]
    })

    if chat_already_exists do
      raise ChatService.Errors.ChatAlreadyExistsError
    end


    {:ok, chat} = Chat.new(%{
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
end
