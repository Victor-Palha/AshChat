defmodule ChatService.MixProject do
  use Mix.Project

  def project do
    [
      app: :chat_service,
      version: "0.1.0",
      elixir: "~> 1.14",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps(),
      compilers: Mix.compilers ++ [:phoenix_swagger],
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {ChatService.Application, []},
      extra_applications: [:logger, :dotenv, :runtime_tools]
    ]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:phoenix, "~> 1.7.11"},
      {:phoenix_live_dashboard, "~> 0.8.3"},
      {:telemetry_metrics, "~> 0.6"},
      {:telemetry_poller, "~> 1.0"},
      {:gettext, "~> 0.20"},
      {:jason, "~> 1.2"},
      {:dns_cluster, "~> 0.1.1"},
      {:bandit, "~> 1.2"},
      {:mongodb_driver, "~> 1.5.0"},
      {:joken, "~> 2.6.2"},
      {:amqp, "~> 4.0"},
      {:dotenv, "~> 3.1.0"},
      {:httpoison, "~> 2.0"},
      {:cors_plug, "~> 3.0"},
      {:ex_aws, "~> 2.5"},
      {:ex_aws_s3, "~> 2.4"},
      {:hackney, "~> 1.18"},
      {:sweet_xml, "~> 0.7"},
      {:phoenix_swagger, "~> 0.8"},
      {:ex_json_schema, "~> 0.5"}
    ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to install project dependencies and perform other setup tasks, run:
  #
  #     $ mix setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    [
      setup: ["deps.get"]
    ]
  end
end
