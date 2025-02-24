defmodule ChatService.Utils.Uuid do
  def generate_uuid do
    segments = [
      generate_segment(8),
      generate_segment(4),
      generate_segment(4),
      generate_segment(4),
      generate_segment(12)
    ]

    Enum.join(segments, "-") |> String.downcase()
  end

  defp generate_segment(length) do
    1..length
    |> Enum.map(fn _ -> :rand.uniform(16) - 1 |> Integer.to_string(16) end)
    |> Enum.join()
  end
end
