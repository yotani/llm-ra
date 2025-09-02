namespace LlmRa.Models
{
    /// <summary>
    /// Represents the structured analysis result returned to the frontend.
    /// </summary>
    public class AnalysisResult
    {
        public List<string>? MostCommonQuestions { get; set; }
        public List<KeywordInfo>? TopKeywords { get; set; }
        public List<UserActivity>? MostActiveUsers { get; set; }
    }

    /// <summary>
    /// Represents a keyword and its frequency.
    /// </summary>
    public class KeywordInfo
    {
        public string? Keyword { get; set; }
        public int Count { get; set; }
    }

    /// <summary>
    /// Represents a user's activity.
    /// </summary>
    public class UserActivity
    {
        public string? UserName { get; set; }
        public int QuestionCount { get; set; }
    }
}
