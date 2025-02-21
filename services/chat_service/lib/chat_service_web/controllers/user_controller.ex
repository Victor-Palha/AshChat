defmodule ChatServiceWeb.UserController do
  use ChatServiceWeb, :controller

  alias ChatService.Utils.R2Uploader
  alias ChatService.Services.User

  def update_user_name(conn, %{"nickname" => nickname}) do
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
    case R2Uploader.upload_file(upload.path, upload.filename, upload.content_type) do
      {:ok, url} -> User.update_user_photo_profile(conn.assigns.user_id, url)
        conn
        |> put_status(:ok)
        |> json(%{message: "Upload successful", url: url})

      {:error, reason} ->
        conn
        |> put_status(500)
        |> json(%{error: inspect(reason)})
    end
  end

  def update_user_photo(conn, _params) do
    conn
    |> put_status(400)
    |> json(%{error: "No photo uploaded"})
  end

  def update_user_description(conn, %{"description" => description}) do
    id = conn.assigns.user_id
    if String.length(description) > 200 do
      conn
      |> put_status(400)
      |> json(%{error: "Description too long"})
    end
    case User.get_user_by_id(id) do
      nil ->
        conn
        |> put_status(404)
        |> json(%{error: "User not found"})
      _user ->
        User.update_user_description(id, description)
        conn
        |> put_status(:ok)
        |> json(%{message: "User updated successfully"})
    end
  end

  def get_user_by_id(conn, __params) do
    user_id = conn.assigns.user_id
    case User.get_user_profile(user_id) do
      {:error, reason} ->
        conn
        |> put_status(404)
        |> json(%{error: reason})
      {:ok, user} ->
        conn
        |> put_status(:ok)
        |> json(%{user: user})
    end
  end

  def get_contact_by_id(conn, %{"id" => user_id}) do
    case User.get_user_profile(user_id) do
      {:error, reason} ->
        conn
        |> put_status(404)
        |> json(%{error: reason})
      {:ok, user} ->
        conn
        |> put_status(:ok)
        |> json(%{user: user})
    end
  end

end
