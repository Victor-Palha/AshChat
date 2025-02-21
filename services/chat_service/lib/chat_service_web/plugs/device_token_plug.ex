defmodule ChatServiceWeb.DeviceTokenPlug do
  import Plug.Conn
  alias ChatService.Auth

  def init(default), do: default

  def call(conn, _opts) do
    with [device_token | _] <- get_req_header(conn, "device_token"),
         {:ok, _message} <- Auth.verify_device_token(conn.assigns[:user_id], device_token) do
      conn
    else
      [] ->
        conn
        |> put_status(:bad_request)
        |> put_resp_content_type("application/json")
        |> send_resp(400, Jason.encode!(%{error: "Device token is missing"}))
        |> halt()

      {:error, reason} ->
        conn
        |> put_status(:unauthorized)
        |> put_resp_content_type("application/json")
        |> send_resp(401, Jason.encode!(%{error: "Invalid device token", details: reason}))
        |> halt()
    end
  end
end
