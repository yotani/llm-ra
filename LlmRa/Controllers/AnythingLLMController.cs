using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;

namespace LlmRa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnythingLLMController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public AnythingLLMController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        [HttpGet("chat-logs/{workspaceName}")]
        public async Task<IActionResult> GetChatLogs(string workspaceName)
        {
            var anythingLLMApiUrl = _configuration["AnythingLLM:ApiUrl"];
            var anythingLLMApiKey = _configuration["AnythingLLM:ApiKey"];

            if (string.IsNullOrEmpty(anythingLLMApiUrl) || string.IsNullOrEmpty(anythingLLMApiKey) || anythingLLMApiKey == "YOUR_API_KEY_HERE")
            {
                return StatusCode(500, "AnythingLLM API URL or API Key is not configured in appsettings.json.");
            }

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", anythingLLMApiKey);
            
            // NOTE: The actual API endpoint for getting chat logs might be different.
            // This is a placeholder based on the provided API docs URL.
            // You might need to adjust the URL path and query parameters.
            var requestUrl = $"{anythingLLMApiUrl}/workspace/{workspaceName}/chats";

            try
            {
                var response = await client.GetAsync(requestUrl);

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    return Ok(content);
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return StatusCode((int)response.StatusCode, $"Error from AnythingLLM API: {errorContent}");
                }
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(503, $"Service Unavailable: Could not connect to AnythingLLM API. {ex.Message}");
            }
        }
    }
}
