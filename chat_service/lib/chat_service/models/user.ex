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

    after_load(&User.afeter_load/1)
    before_dump(&User.before_dump/1)
  end

  def afeter_load(%__MODULE__{_id: id} = data) do
    %__MODULE__{data | id: BSON.ObjectId.encode(id)}
  end

  def before_dump(data) do
    %__MODULE__{data | id: nil}
  end

  @spec new(%{
          :description => String.t(),
          :device_token => String.t(),
          :id => String.t(),
          :nickname => String.t(),
          :photo_url => String.t(),
          :preferred_language => String.t(),
          :tag_user_id => String.t()
        }) :: ChatService.Models.User.t()
  def new(%{
    id: id,
    nickname: nickname,
    description: description,
    photo_url: photo_url,
    preferred_language: preferred_language,
    tag_user_id: tag_user_id,
    device_token: device_token
  }) do
    new()
    |> Map.put(:id, id)
    |> Map.put(:nickname, nickname)
    |> Map.put(:description, description)
    |> Map.put(:photo_url, photo_url)
    |> Map.put(:preferred_language, preferred_language)
    |> Map.put(:tag_user_id, tag_user_id)
    |> Map.put(:device_token, device_token)
    |> afeter_load()
  end
end
