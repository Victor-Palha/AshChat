defmodule ChatService.Utils.HashSha256 do
  def call(data_to_hash) do
    :crypto.hash(:sha256, String.trim(to_string(data_to_hash))) |> Base.encode16(case: :lower)
  end
end
