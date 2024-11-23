defmodule ChatService.Handlers.QueueConfirmNewAccount do
  require Logger

  alias ChatService.Models.User
  alias ChatService.Repo

  @default_photo_url "https://static.vecteezy.com/system/resources/previews/020/765/399/non_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"

  def handle_message(%{
        "id" => id,
        "nickname" => nickname,
        "preferredLanguage" => preferredLanguage,
        "unique_device_token" => unique_device_token,
        "notification_token" => notification_token
      } = msg, _meta) do

    Logger.info("Processing message for Queue: #{inspect(msg)}")

    case Repo.exists?(User, %{id: id}) do
      true ->
        Logger.info("User already exists in the database")
        {:conflict, %{status: "User already exists in the database"}}

      false ->
        Logger.info("User does not exist in the database")

        # Gera o tag_user_id de forma segura e única
        user_tag =
          nickname
          |> String.downcase()
          |> String.replace(~r/[^a-z0-9]/, "_")
          |> String.trim()
          |> Kernel.<>("_" <> Base.encode64(:crypto.strong_rand_bytes(8), padding: false))

        User.new(%{
          id: id,
          nickname: nickname,
          description: "Hey! I'm using AshChat!",
          photo_url: @default_photo_url,
          tag_user_id: user_tag,
          preferred_language: preferredLanguage,
          device_token: unique_device_token,
          notification_token: notification_token
        })
        |> Repo.insert()

        {:ok, %{status: "User created successfully"}}
    end
  end
end
