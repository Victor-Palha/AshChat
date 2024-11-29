defmodule ChatService.Models.Message do
  @enforce_keys [:id, :sender_id, :content, :timestamp, :status]
  defstruct id: "",
            sender_id: "",
            content: "",
            translated_content: "",
            timestamp: "",
            status: ""
            # mobile_ref_id: ""

  @type t :: %__MODULE__{
          id: String.t(),
          sender_id: String.t(),
          content: String.t(),
          translated_content: String.t(),
          timestamp: String.t(),
          status: String.t(),
          # mobile_ref_id: String.t()
        }

  def to_map(%__MODULE__{} = message) do
    Map.from_struct(message)
  end
end
