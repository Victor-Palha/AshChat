defmodule ChatService.Models.Chat do
  use Mongo.Collection
  alias ChatService.Models.Message
  alias __MODULE__

  collection("chats") do
    attribute :id, String.t(), derived: true
    attribute :users_id, [String.t()]
    attribute :messages, [ChatService.Models.Message.t()]
    attribute :same_language, boolean(), default: false

    after_load(&Chat.afeter_load/1)
    before_dump(&Chat.before_dump/1)
  end

  def afeter_load(%__MODULE__{_id: id} = data) do
    %__MODULE__{data | id: BSON.ObjectId.encode(id)}
  end

  def before_dump(data) do
    %__MODULE__{data | id: nil}
  end

  def new(%{users_id: users_id, messages: messages, same_language: same_language}) do
    new()
    |> Map.put(:users_id, users_id)
    |> Map.put(:messages, Enum.map(messages, &Message.to_map(&1)))
    |> Map.put(:same_language, same_language)
    |> afeter_load()
  end
end
