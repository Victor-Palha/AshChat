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
end
