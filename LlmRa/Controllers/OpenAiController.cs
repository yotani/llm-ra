using Microsoft.AspNetCore.Mvc;
using LlmRa.Models;
using System.Text.Json;
using System.Text;

namespace LlmRa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OpenAiController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<OpenAiController> _logger;

        public OpenAiController(IHttpClientFactory httpClientFactory, ILogger<OpenAiController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        [HttpPost("analyze")]
        public async Task<IActionResult> AnalyzeText([FromBody] AnalysisRequest request, [FromHeader(Name = "X-OpenAI-ApiKey")] string openAiApiKey)
        {
            if (string.IsNullOrEmpty(openAiApiKey))
            {
                return BadRequest("OpenAI API Key is missing. Please provide it in the 'X-OpenAI-ApiKey' header.");
            }

            if (request == null || string.IsNullOrWhiteSpace(request.TextToAnalyze))
            {
                return BadRequest("Text to analyze cannot be empty.");
            }

            // Truncate the input to avoid exceeding OpenAI's token-per-minute (TPM) rate limits.
            // This is a safeguard against very large chat logs.
            const int MAX_CHAR_LIMIT = 200000; 
            var textToAnalyze = request.TextToAnalyze;
            if (textToAnalyze.Length > MAX_CHAR_LIMIT)
            {
                // Take the most recent part of the logs by taking from the end of the string.
                textToAnalyze = textToAnalyze.Substring(textToAnalyze.Length - MAX_CHAR_LIMIT);
            }

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", openAiApiKey);

            var openAiRequest = new OpenApiChatRequest
            {
                Model = "gpt-4o",
                ResponseFormat = new ResponseFormat { Type = "json_object" },
                Messages = new List<OpenApiMessage>
                {
                    new OpenApiMessage
                    {
                        Role = "system",
                        Content = "You are a data analysis expert. Please analyze the following chat logs and return a JSON object containing: 'most_common_questions' (a list of the most frequently asked questions), 'top_keywords' (the top 10 keywords and their counts), and 'most_active_users' (the users who asked the most questions this month)."
                    },
                    new OpenApiMessage
                    {
                        Role = "user",
                        Content = textToAnalyze
                    }
                }
            };

            var jsonRequest = JsonSerializer.Serialize(openAiRequest);
            var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

            try
            {
                var response = await client.PostAsync("https://api.openai.com/v1/chat/completions", content);
                var responseBody = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Received successful response from OpenAI: {ResponseBody}", responseBody);
                    var openAiResponse = JsonSerializer.Deserialize<OpenApiChatResponse>(responseBody);
                    
                    if (openAiResponse?.Choices != null && openAiResponse.Choices.Count > 0 && openAiResponse.Choices[0].Message?.Content != null)
                    {
                        var analysisResult = openAiResponse.Choices[0].Message.Content;
                        // The result from OpenAI should already be a JSON string, so we return it directly.
                        return Content(analysisResult, "application/json");
                    }
                    
                    _logger.LogWarning("OpenAI response was successful, but content was not in the expected format. Raw response: {ResponseBody}", responseBody);
                    return StatusCode(500, $"Failed to parse response from OpenAI. Raw response: {responseBody}");
                }
                else
                {
                    _logger.LogError("Error from OpenAI API. Status: {StatusCode}, Body: {ResponseBody}", response.StatusCode, responseBody);
                    return StatusCode((int)response.StatusCode, $"Error from OpenAI API: {responseBody}");
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Could not connect to OpenAI API.");
                return StatusCode(503, $"Service Unavailable: Could not connect to OpenAI API. {ex.Message}");
            }
        }
    }
}
