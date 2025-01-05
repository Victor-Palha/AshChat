defmodule ChatService.Services.User do
  alias ChatService.Models.User, as: User
  alias ChatService.Repo, as: Repo
  alias ChatService.Utils.HashSha256

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

  def update_user_description(user_id, new_description) do
    user_id = BSON.ObjectId.decode!(user_id)
    case Mongo.update_one(:mongo, "users", %{"_id" => user_id}, %{"$set" => %{"description" => new_description}}) do
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

  def update_user_tokens(user_id, new_device_token, new_notification_token) do
    user_id = BSON.ObjectId.decode!(user_id)
    hashed_device_token = HashSha256.call(new_device_token)
    case Mongo.update_one(:mongo, "users", %{"_id" => user_id}, %{"$set" => %{"device_token" => hashed_device_token, "notification_token" => new_notification_token}}) do
      {:ok, result} -> {:ok, result}
      {:error, reason} -> {:error, reason}
    end
  end

  def get_user_profile(user_id) do
    user_id = BSON.ObjectId.decode!(user_id)
    case Mongo.find_one(:mongo, "users", %{"_id" => user_id}) do
      nil -> {:error, :user_not_found}
      {:error, _} -> {:error, :database_error}
      user ->
        user_response = %{
          nickname: user["nickname"],
          description: user["description"],
          photo_url: user["photo_url"],
          preferred_language: user["preferred_language"],
          tag_user_id: user["tag_user_id"],
        }
        {:ok, user_response}
    end
  end

  def get_all_chats_from_user(user_id) do
    user_id = BSON.ObjectId.decode!(user_id)
    user = Mongo.find_one(:mongo, "users", %{"_id" => user_id})
    if user == nil do
      {:error, :user_not_found}
    else
      chats = user["chats_id"]
      {:ok, chats}
    end
  end
end
