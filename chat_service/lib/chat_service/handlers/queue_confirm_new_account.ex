defmodule ChatService.Handlers.QueueConfirmNewAccount do
  require Logger

  alias ChatService.Models.User
  alias ChatService.Repo

  @default_photo_url "http://localhost:3006/files/default.jpg"

  def handle_message(%{
        "id" => id,
        "nickname" => nickname,
        "preferredLanguage" => preferredLanguage,
        "unique_device_token" => unique_device_token,
        "notification_token" => notification_token
      } = msg, _meta) do

    Logger.info("Processing message for Queue: #{inspect(msg)}")

    case BSON.ObjectId.decode(id) do
      {:ok, _} ->
        case Repo.exists?(User, %{id: id}) do
          true ->
            Logger.info("User already exists in the database")
            {:conflict, %{status: "User already exists in the database"}}

          false ->
            user_tag =
              nickname
              |> String.downcase()
              |> String.replace(~r/[^a-z0-9]/, "_")
              |> String.trim()
              |> Kernel.<>("_" <> Base.encode64(:crypto.strong_rand_bytes(8), padding: false))
              |> String.trim()

            user = User.new(%{
              :id => id,
              :nickname => nickname,
              :description => "Hey! I'm using AshChat! :)",
              :photo_url => @default_photo_url,
              :tag_user_id => user_tag,
              :device_token => :crypto.hash(:sha256, to_string(unique_device_token)) |> Base.encode16() |> String.downcase(),
              :notification_token => to_string(notification_token),
              :preferred_language => preferredLanguage
            })

            Repo.insert(user)

            {:ok, %{status: "User created successfully"}}
        end

      :error ->
        Logger.error("Invalid BSON ObjectId: #{id}")
        {:error, %{status: "Invalid ID format"}}
    end
  end
end
