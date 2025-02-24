defmodule ChatServiceWeb.UserController do
  use ChatServiceWeb, :controller
  use PhoenixSwagger

  alias ChatServiceWeb.CommonParameters
  alias ChatService.Utils.R2Uploader
  alias ChatService.Services.User

  swagger_path :update_user_name do
    patch("/api/user/nickname")
    summary("Update user nickname")
    description("Updates the nickname of the authenticated user.")
    consumes(["application/json"])
    produces(["application/json"])
    security [%{jwtAuth: []}, %{deviceTokenAuth: []}]
    CommonParameters.authorization

    parameters do
      nickname(:body, :string, "New nickname", required: true, example: "John Doe")
    end

    response 200, "User updated successfully",
    %{ example: %{ "message" => "User updated successfully" } }

    response 404, "User not found",
    %{ example: %{ "error" => "User not found" } }
  end
  def update_user_name(conn, %{"nickname" => nickname}) do
    id = conn.assigns.user_id
    case User.get_user_by_id(id) do
      nil ->
        conn |> put_status(404) |> json(%{error: "User not found"})
      _user ->
        User.update_user_name(id, nickname)
        conn |> put_status(:ok) |> json(%{message: "User updated successfully"})
    end
  end

  swagger_path :update_user_photo do
    patch("/api/user/photo")
    summary("Update user profile photo")
    description("Uploads and updates the profile photo of the authenticated user.")
    consumes(["multipart/form-data"])
    produces(["application/json"])
    security [%{jwtAuth: []}, %{deviceTokenAuth: []}]
    CommonParameters.authorization

    parameters do
      photo(:body, :file, "Profile photo", required: true)
    end

    response 200, "Upload successful",
    %{ example: %{ "message" => "Upload successful", "url" => "https://static.victor-palha.com/uploads/profile123.png" } }

    response 400, "No photo uploaded",
    %{ example: %{ "error" => "No photo uploaded" } }

    response 500, "Upload failed",
    %{ example: %{ "error" => "Internal server error during upload" } }
  end
  def update_user_photo(conn, %{"photo" => %Plug.Upload{} = upload}) do
    case R2Uploader.upload_file(upload.path, upload.filename, upload.content_type) do
      {:ok, url} -> User.update_user_photo_profile(conn.assigns.user_id, url)
        conn |> put_status(:ok) |> json(%{message: "Upload successful", url: url})

      {:error, reason} ->
        conn |> put_status(500) |> json(%{error: inspect(reason)})
    end
  end

  def update_user_photo(conn, _params) do
    conn |> put_status(400) |> json(%{error: "No photo uploaded"})
  end

  swagger_path :update_user_description do
    patch("/api/user/description")
    summary("Update user description")
    description("Updates the description of the authenticated user.")
    consumes(["application/json"])
    produces(["application/json"])
    security [%{jwtAuth: []}, %{deviceTokenAuth: []}]
    CommonParameters.authorization

    parameters do
      description(:body, :object, "New description", required: true, example: %{ "description" => "Hey I'm Ash, a Fullstack developer!" })
    end

    response 200, "User updated successfully",
    %{ example: %{ "message" => "User updated successfully" } }

    response 400, "Description too long",
    %{ example: %{ "error" => "Description exceeds the maximum allowed length" } }

    response 404, "User not found",
    %{ example: %{ "error" => "User not found" } }
  end
  def update_user_description(conn, %{"description" => description}) do
    id = conn.assigns.user_id
    if String.length(description) > 200 do
      conn |> put_status(400) |> json(%{error: "Description exceeds the maximum allowed length"})
    end
    case User.get_user_by_id(id) do
      nil ->
        conn |> put_status(404) |> json(%{error: "User not found"})
      _user ->
        User.update_user_description(id, description)
        conn |> put_status(:ok) |> json(%{message: "User updated successfully"})
    end
  end

  swagger_path :get_user_by_id do
    get("/api/user")
    summary("Get user profile")
    description("Retrieves the profile of the authenticated user.")
    produces(["application/json"])
    security [%{jwtAuth: []}, %{deviceTokenAuth: []}]
    CommonParameters.authorization

    response 200, "User profile retrieved",
    %{ example: %{
        "user" => %{
          "nickname" => "JohnDoe",
          "description" => "Hey, I'm a Fullstack developer!",
          "photo_url" => "https://static.victor-palha.com/profile.jpg",
          "preferred_language" => "en",
          "tag_user_id" => "ash_chat_17280273"
        }
      }
    }

    response 404, "User not found",
    %{ example: %{ "error" => "User not found" } }
  end
  def get_user_by_id(conn, __params) do
    user_id = conn.assigns.user_id
    case User.get_user_profile(user_id) do
      {:error, reason} ->
        conn |> put_status(404) |> json(%{error: reason})
      {:ok, user} ->
        conn |> put_status(:ok) |> json(%{user: user})
    end
  end

  swagger_path :get_contact_by_id do
    get("/api/user/{id}")
    summary("Get contact profile")
    description("Retrieves the profile of a contact by ID.")
    produces(["application/json"])
    security [%{jwtAuth: []}, %{deviceTokenAuth: []}]
    CommonParameters.authorization

    parameters do
      id(:path, :string, "Contact user ID", required: true, example: "507f1f77bcf86cd799439011")
    end

    response 200, "User profile retrieved",
    %{ example: %{
        "user" => %{
          "nickname" => "JaneDoe",
          "description" => "Hey, I'm using AshChat!",
          "photo_url" => "https://static.victor-palha.com/profile.jpg",
          "preferred_language" => "en",
          "tag_user_id" => "ash_chat_17280273"
        }
      }
    }

    response 404, "User not found",
    %{ example: %{ "error" => "User not found" } }
  end
  def get_contact_by_id(conn, %{"id" => user_id}) do
    case User.get_user_profile(user_id) do
      {:error, reason} ->
        conn |> put_status(404) |> json(%{error: reason})
      {:ok, user} ->
        conn |> put_status(:ok) |> json(%{user: user})
    end
  end
end
