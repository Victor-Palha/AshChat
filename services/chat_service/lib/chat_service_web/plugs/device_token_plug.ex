defmodule ChatServiceWeb.DeviceTokenPlug do
  import Plug.Conn
  alias ChatService.Auth

  def init(default), do: default

  def call(conn, _opts) do
    device_token = conn |> get_req_header("device_token") |>  List.first()
    case device_token do
      nil ->
        conn
        |> put_status(:bad_request)
        |> halt()
      device_token ->
        case Auth.verify_device_token(conn.assigns[:user_id], device_token) do
          {:ok, _message} ->
            conn
          {:error, _reason} ->
            conn
            |> put_status(:unauthorized)
            |> halt()
        end
    end
  end
end
