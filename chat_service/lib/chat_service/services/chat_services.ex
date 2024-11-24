defmodule ChatService.Services.Chat do
  alias ChatService.Models.Chat, as: Chat
  alias ChatService.Models.User, as: User
  alias ChatService.Repo, as: Repo

  def create_chat(%{
    "sender_id" => sender_id,
    "receiver_tag" => receiver_tag,
  }) do
    IO.puts(sender_id)
    sender = Repo.get_by(User, id: sender_id)
    receiver = Repo.get_by(User, tag_user_id: receiver_tag)
    IO.inspect(sender, label: "sender")
    IO.inspect(receiver, label: "receiver")
    unless sender && receiver do
      raise ChatService.Errors.UserNotFoundError
    end

    chat_already_exists = Repo.exists?(Chat, %{
      users_id: [sender.id, receiver.id]
    })

    if chat_already_exists do
      raise ChatService.Errors.ChatAlreadyExistsError
    end


    Chat.new(%{
      users_id: [sender.id, receiver.id],
      same_language: sender.language == receiver.language
    })
    |> Repo.insert()

    rescue
      e in [ChatService.Errors.UserNotFoundError, ChatService.Errors.ChatAlreadyExistsError] ->
        {:error, e}
      e in Mongo.Error ->
        {:error, e}
  end
end
