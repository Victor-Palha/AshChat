defmodule ChatServiceWeb.UserController do
  use ChatServiceWeb, :controller

  alias ChatService.Services.User
  alias ChatService.Utils.Uuid
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
    filename = "#{Uuid.generate_uuid()}_#{upload.filename}" |> String.replace(" ", "_") |> String.downcase()
    uploads_path = Path.join(["priv/static/uploads", filename])
    case File.cp(upload.path, uploads_path) do
      :ok ->
        url = ChatServiceWeb.Endpoint.static_url() <> "/uploads/#{filename}"

        User.update_user_photo_profile(conn.assigns.user_id, url)
        conn
        |> put_status(:ok)
        |> json(%{message: "Upload successful", url: url})

      {:error, reason} ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "Failed to save upload: #{reason}"})
    end
  end

  def update_user_photo(conn, _params) do
    conn
    |> put_status(400)
    |> json(%{error: "No photo uploaded"})
  end
end
