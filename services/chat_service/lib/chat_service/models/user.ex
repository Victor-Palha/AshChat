defmodule ChatService.Models.User do
  use Mongo.Collection
  alias __MODULE__

  collection("users") do
    attribute :id, String.t(), derived: true
    attribute :nickname, String.t()
    attribute :description, String.t()
    attribute :photo_url, String.t()
    attribute :preferred_language, String.t()
    attribute :online, boolean(), default: false
    attribute :last_seen_at, DateTime.t(), default: DateTime.utc_now()
    attribute :chats_id, [String.t()], default: []
    attribute :contacts_id, [String.t()], default: []
    attribute :blocked_id, [String.t()], default: []
    attribute :tag_user_id, [String.t()]
    attribute :device_token, String.t()
    attribute :notification_token, String.t()

    after_load &User.after_load/1
    before_dump &User.before_dump/1
  end

  def after_load(%User{_id: id} = data) do
    %User{data | id: BSON.ObjectId.encode!(id)}
  end

  def before_dump(%User{id: id} = data) when is_binary(id) do
    %User{data | _id: BSON.ObjectId.decode!(id)}
  end

  def new(%{
    id: id,
    nickname: nickname,
    description: description,
    photo_url: photo_url,
    preferred_language: preferred_language,
    tag_user_id: tag_user_id,
    device_token: device_token,
    notification_token: notification_token
  }) do
    new()
    |> Map.put(:id, id)
    |> Map.put(:_id, BSON.ObjectId.decode!(id))
    |> Map.put(:nickname, nickname)
    |> Map.put(:description, description)
    |> Map.put(:photo_url, photo_url)
    |> Map.put(:preferred_language, preferred_language)
    |> Map.put(:tag_user_id, tag_user_id)
    |> Map.put(:device_token, device_token)
    |> Map.put(:notification_token, notification_token)
    |> after_load()
  end
end
