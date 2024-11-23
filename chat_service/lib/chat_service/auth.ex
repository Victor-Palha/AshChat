defmodule ChatService.Auth do
    use Joken.Config

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
end
