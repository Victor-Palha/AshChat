defmodule ChatService.Auth do
    use Joken.Config
    alias ChatService.Services.User

    def verify_token(token) do
      signer = Joken.Signer.parse_config(:rs256)
      Joken.verify(token, signer) |> response()
    end

    defp response({:ok, claims}) do
      {:ok, claims}
    end

    defp response({:error, reason}) do
      {:error, reason}
    end

    def verify_device_token(user_id, device_unique_id) do
      case User.get_user_by_id(user_id) do
        nil ->
          {:error, "User not found"}
        user ->
          if user.device_token == :crypto.hash(:sha256, to_string(device_unique_id)) |> Base.encode16() |> String.downcase() do
            {:ok, "Device token verified"}
          else
            {:error, "Device token not verified"}
          end
      end
    end
end
