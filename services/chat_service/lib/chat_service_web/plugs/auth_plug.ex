defmodule ChatServiceWeb.AuthPlug do
  import Plug.Conn
  alias ChatService.Auth

  def init(default), do: default

  def call(conn, _opts) do
    with [token | _] <- get_req_header(conn, "authorization"),
         token <- String.replace(token, "Bearer ", ""),
         {:ok, claims} <- Auth.verify_token(token) do
      conn
      |> assign(:user_id, claims["sub"])
    else
      [] ->
        conn
        |> put_status(:unauthorized)
        |> put_resp_content_type("application/json")
        |> send_resp(401, Jason.encode!(%{error: "Authorization header is missing"}))
        |> halt()

      {:error, reason} ->
        conn
        |> put_status(:unauthorized)
        |> put_resp_content_type("application/json")
        |> send_resp(401, Jason.encode!(%{error: "Invalid token", details: reason}))
        |> halt()
    end
  end
end
