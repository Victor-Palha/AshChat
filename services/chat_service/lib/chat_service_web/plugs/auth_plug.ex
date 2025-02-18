defmodule ChatServiceWeb.AuthPlug do
  import Plug.Conn
  alias ChatService.Auth

  def init(default), do: default

  def call(conn, _opts) do
    token = get_req_header(conn, "authorization") |> List.first()

    if token do
      token = String.replace(token, "Bearer ", "")

      case Auth.verify_token(token) do
        {:ok, claims} ->
          conn
          |> assign(:user_id, claims["sub"])
          |> put_status(:ok)
        {:error, _reason} ->
          conn
          |> put_status(:unauthorized)
          |> halt()
      end
    else
      conn
      |> put_status(:unauthorized)
      |> halt()
    end
  end
end
