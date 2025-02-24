defmodule ChatServiceWeb.CommonParameters do
    @moduledoc "Common parameter declarations for phoenix swagger"
    use PhoenixSwagger
    alias PhoenixSwagger.Path.PathObject
    import PhoenixSwagger.Path

    def authorization(path = %PathObject{}) do
      path
      |> parameter("Authorization", :header, :string, "JWT access token", required: true)
      |> parameter("device_token", :header, :string, "Device Unique Token", required: true)
    end

    def swagger_definitions do
      %{
        securitySchemes: %{
          jwtAuth: %{
            type: "apiKey",
            in: "header",
            name: "Authorization",
            description: "JWT access token"
          },
          deviceTokenAuth: %{
            type: "apiKey",
            in: "header",
            name: "device_token",
            description: "Device Unique Token"
          }
        }
      }
    end
end
