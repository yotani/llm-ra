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
        public string Model { get; set; } = "gpt-3.5-turbo";
        public List<OpenApiMessage> Messages { get; set; } = new List<OpenApiMessage>();
        public ResponseFormat? ResponseFormat { get; set; }
    }

    public class OpenApiMessage
    {
        public string Role { get; set; } = "user";
        public string Content { get; set; } = "";
    }

    public class ResponseFormat
    {
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
