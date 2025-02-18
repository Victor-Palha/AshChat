defmodule ChatService.Handlers.QueueChangeDeviceTokenQueue do
  require Logger
  alias ChatService.Services.User

  def handle_message(%{
    "id" => id,
    "unique_device_token" => unique_device_token,
    "notification_token" => notification_token,
  } = msg, _meta) do

    Logger.info("Processing message for Queue: #{inspect(msg)}")

    case User.update_user_tokens(id, unique_device_token, notification_token) do
      {:ok, _} -> {:ok, %{status: "User updated successfully"}}
      {:error, reason} ->
        Logger.error("Failed to update user: #{inspect(reason)}")
        {:error, reason}
    end

  end
end
