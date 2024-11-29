defmodule ChatService.Models.Chat do
  use Mongo.Collection
  alias __MODULE__

  collection("chats") do
    attribute :id, String.t(), derived: true
    attribute :users_id, [String.t()]
    attribute :messages, [ChatService.Models.Message.t()], default: []
    attribute :same_language, boolean(), default: false

    after_load(&Chat.after_load/1)
    before_dump(&Chat.before_dump/1)
  end

  def after_load(%Chat{_id: id} = data) do
    %Chat{data | id: BSON.ObjectId.encode!(id)}
  end

  def before_dump(%Chat{id: id} = data) when is_binary(id) do
    %Chat{data | _id: BSON.ObjectId.decode!(id)}
  end

  def new(%{users_id: users_id, same_language: same_language}) do
    new()
    |> Map.put(:users_id, users_id)
    |> Map.put(:same_language, same_language)
    |> after_load()
  end
end
