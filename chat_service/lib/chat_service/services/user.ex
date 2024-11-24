defmodule ChatService.Services.User do
  alias ChatService.Models.User, as: User
  alias ChatService.Repo, as: Repo

  def get_user_by_id(user_id) do
    user_id = BSON.ObjectId.decode!(user_id)
    Repo.get(User, user_id)
  end

  def get_user_by_tag(tag) do
    Repo.get_by(User, tag_user_id: tag)
  end

  def add_chat_to_user(user_id, chat_id) do
    user_id = BSON.ObjectId.decode!(user_id)
    user = Repo.get(User, user_id)
    chat_already_exists = Enum.any?(user.chats_id, fn chat_id -> chat_id == chat_id end)

    if chat_already_exists do
      raise ChatService.Errors.ChatAlreadyExistsError
    end

    Map.put(user, :chats_id, user.chats_id ++ [chat_id]) |> Repo.update()
  end

  def add_contact_to_user(user_id, contact_id) do
    user_id = BSON.ObjectId.decode!(user_id)
    user = Repo.get(User, user_id)
    contact_already_exists = Enum.any?(user.contacts_id, fn contact_id -> contact_id == contact_id end)

    if contact_already_exists do
      raise ChatService.Errors.ContactAlreadyExistsError
    end

    Map.put(user, :contacts_id, user.contacts_id ++ [contact_id]) |> Repo.update()
  end
end
