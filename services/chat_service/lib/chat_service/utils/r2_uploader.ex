defmodule ChatService.Utils.R2Uploader do
  alias ExAws.S3
  alias ChatService.Utils.Uuid

  @bucket "ashchat-uploads"
  @base_url "https://static.victor-palha.com"


  def upload_file(file_path, object_name, content_type) do
    file_content = File.read!(file_path)
    unique_object_name = Uuid.generate_uuid() <> object_name
    config = ExAws.Config.new(
      :s3,
      access_key_id: System.get_env("R2_ACCESS_KEY"),
      secret_access_key: System.get_env("R2_SECRET_KEY"),
      host: System.get_env("R2_ENDPOINT_URL"),
      region: "auto",
      scheme: "https://"
    )
    headers = [{:content_type, content_type}]
    IO.inspect(headers)
    object = S3.put_object(@bucket, unique_object_name, file_content, headers) |> ExAws.request(Map.to_list(config))
    case object do
      {:ok, _response} -> {:ok, get_public_url(unique_object_name)}
      {:error, reason} -> {:error, reason}
    end
  end

  defp get_public_url(object_name) do
    "#{@base_url}/#{object_name}"
  end
end
