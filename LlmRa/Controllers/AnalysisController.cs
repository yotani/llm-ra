using Microsoft.AspNetCore.Mvc;
using LlmRa.Models;
using System.Text.Json;

namespace LlmRa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalysisController : ControllerBase
    {
        // In a real application, you might store and retrieve this from a database or cache.
        // For this task, we'll use a static field to hold the latest result.
        private static AnalysisResult? _latestAnalysisResult;

        /// <summary>
        /// Endpoint to receive and store the analysis result from the OpenAI process.
        /// This would typically be called internally by another service.
        /// </summary>
        [HttpPost("update")]
        public IActionResult UpdateAnalysisResult([FromBody] JsonElement rawResult)
        {
            if (rawResult.ValueKind == JsonValueKind.Undefined)
            {
                return BadRequest("Invalid JSON data.");
            }

            try
            {
                // Deserialize the raw JSON into our strongly-typed model.
                // This also validates that the JSON from OpenAI matches our expected structure.
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                _latestAnalysisResult = JsonSerializer.Deserialize<AnalysisResult>(rawResult.GetRawText(), options);

                if (_latestAnalysisResult == null)
                {
                    return BadRequest("The provided JSON does not match the expected AnalysisResult structure.");
                }

                return Ok("Analysis result updated successfully.");
            }
            catch (JsonException ex)
            {
                return BadRequest($"Failed to deserialize JSON: {ex.Message}");
            }
        }

        /// <summary>
        /// Endpoint for the frontend to get the latest analysis results.
        /// </summary>
        [HttpGet("results")]
        public IActionResult GetAnalysisResults()
        {
            if (_latestAnalysisResult == null)
            {
                return NotFound("No analysis result available. Please run an analysis first.");
            }

            return Ok(_latestAnalysisResult);
        }
    }
}
