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
    user = Mongo.find_one(:mongo, "users", %{"_id" => user_id})
    if user == nil do
      {:error, :user_not_found}
    else
      chat_already_exists = Enum.any?(user["chats_id"], fn existing_chat_id -> existing_chat_id == chat_id end)

      if chat_already_exists do
        raise ChatService.Errors.ChatAlreadyExistsError
      end

      updated_chats = user["chats_id"] ++ [chat_id]

      case Mongo.update_one(:mongo, "users", %{"_id" => user_id}, %{"$set" => %{"chats_id" => updated_chats}}) do
        {:ok, result} -> {:ok, result}
        {:error, reason} -> {:error, reason}
      end
    end
  rescue
    e in [ChatService.Errors.ChatAlreadyExistsError] ->
      {:error, e}
    e in Mongo.Error ->
      {:error, e}
  end

  def add_contact_to_user(user_id, contact_id) do
    user_id = BSON.ObjectId.decode!(user_id)
    user = Mongo.find_one(:mongo, "users", %{"_id" => user_id})
    if user == nil do
      {:error, :user_not_found}
    else
      contact_already_exists = Enum.any?(user["contacts_id"], fn existing_contact_id -> existing_contact_id == contact_id end)
      if contact_already_exists do
        raise ChatService.Errors.ContactAlreadyExistsError
      end
      updated_contacts = user["contacts_id"] ++ [contact_id]
      case Mongo.update_one(:mongo, "users", %{"_id" => user_id}, %{"$set" => %{"contacts_id" => updated_contacts}}) do
        {:ok, result} -> {:ok, result}
        {:error, reason} -> {:error, reason}
      end
    end
  rescue
    e in [ChatService.Errors.ContactAlreadyExistsError] ->
      {:error, e}
    e in Mongo.Error ->
      {:error, e}
  end

  def update_user_name(user_id, new_name) do
    user_id = BSON.ObjectId.decode!(user_id)
    case Mongo.update_one(:mongo, "users", %{"_id" => user_id}, %{"$set" => %{"nickname" => new_name}}) do
      {:ok, result} -> {:ok, result}
      {:error, reason} -> {:error, reason}
    end
  end

  def update_user_photo_profile(user_id, new_photo_url) do
    user_id = BSON.ObjectId.decode!(user_id)
    case Mongo.update_one(:mongo, "users", %{"_id" => user_id}, %{"$set" => %{"photo_url" => new_photo_url}}) do
      {:ok, result} -> {:ok, result}
      {:error, reason} -> {:error, reason}
    end
  end
end
