defmodule ChatServiceWeb.SwaggerController do
  use ChatServiceWeb, :controller

  def index(conn, _params) do
    swagger_json = File.read!("priv/static/swagger.json")
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, swagger_json)
  end
end
