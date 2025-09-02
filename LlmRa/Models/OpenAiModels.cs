using System.Text.Json.Serialization;

namespace LlmRa.Models
{
    // Model for the request body sent to our new endpoint
    public class AnalysisRequest
    {
        public string? TextToAnalyze { get; set; }
    }

    // Models for interacting with OpenAI API
    public class OpenApiChatRequest
    {
        [JsonPropertyName("model")]
        public string Model { get; set; } = "gpt-3.5-turbo";
        [JsonPropertyName("messages")]
        public List<OpenApiMessage> Messages { get; set; } = new List<OpenApiMessage>();
        [JsonPropertyName("response_format")]
        public ResponseFormat? ResponseFormat { get; set; }
    }

    public class OpenApiMessage
    {
        [JsonPropertyName("role")]
        public string Role { get; set; } = "user";
        [JsonPropertyName("content")]
        public string Content { get; set; } = "";
    }

    public class ResponseFormat
    {
        [JsonPropertyName("type")]
        public string Type { get; set; } = "json_object";
    }

    public class OpenApiChatResponse
    {
        public List<Choice>? Choices { get; set; }
    }

    public class Choice
    {
        public OpenApiMessage? Message { get; set; }
    }
}
