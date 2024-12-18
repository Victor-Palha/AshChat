defmodule ChatServiceWeb.UserController do
  use ChatServiceWeb, :controller

  alias ChatService.Services.User

  def update_name(conn, %{"nickname" => nickname}) do
    id = conn.assigns.user_id
    case User.get_user_by_id(id) do
      nil ->
        conn
        |> put_status(404)
        |> json(%{error: "User not found"})
      _user ->
        User.update_user_name(id, nickname)
        conn
        |> put_status(:ok)
        |> json(%{message: "User updated successfully"})
    end
  end

  def update_user_photo(conn, %{"photo" => %Plug.Upload{} = upload}) do
      file_content = upload.path |> File.read!() |> Base.encode64()
      mime_type = MIME.type(Path.extname(upload.filename) |> String.trim_leading("."))

      multipart = {:multipart, [
        {"file", file_content, {"form-data", [{"name", "file"}, {"filename", upload.filename}]},
          [{"Content-Type", mime_type}]}
      ]}

      api_url = Application.get_env(:chat_service, ChatServiceWeb.Endpoint)[:static_server_url]
      case HTTPoison.post("#{api_url}/upload", multipart, []) do
        {:ok, %HTTPoison.Response{status_code: 201, body: body}} ->
          photo_url = "#{api_url}/files/#{body}"
          User.update_user_photo_profile(conn.assigns.user_id, photo_url)
          conn
          |> put_status(:ok)
          |> json(%{message: "Upload successful", url: photo_url})

        {:ok, %HTTPoison.Response{status_code: status_code, body: body}} ->
          conn
          |> put_status(status_code)
          |> json(%{error: body})

        {:error, %HTTPoison.Error{reason: reason}} ->
          IO.puts("Error: #{inspect(reason)}")
          conn
          |> put_status(500)
          |> json(%{error: reason})
      end
  end

  def update_user_photo(conn, _params) do
    conn
    |> put_status(400)
    |> json(%{error: "No photo uploaded"})
  end
end