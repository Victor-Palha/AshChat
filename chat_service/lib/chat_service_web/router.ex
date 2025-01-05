defmodule ChatServiceWeb.Router do
  use ChatServiceWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
    plug ChatServiceWeb.AuthPlug
    plug ChatServiceWeb.DeviceTokenPlug
  end

  scope "/api", ChatServiceWeb do
    pipe_through :api

    post "/chat", ChatController, :create
    patch "/user/nickname", UserController, :update_user_name
    patch "/user/description", UserController, :update_user_description
    patch "/user/photo", UserController, :update_user_photo
    get "/user", UserController, :get_user_by_id
    get "/chats", ChatController, :get_chats
  end



  # Enable LiveDashboard in development
  if Application.compile_env(:chat_service, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through [:fetch_session, :protect_from_forgery]

      live_dashboard "/dashboard", metrics: ChatServiceWeb.Telemetry
    end
  end
end
