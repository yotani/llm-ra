# 工作項目：OpenAI API 整合

## 任務目標
將從 Anything LLM 獲取的對話記錄，整理成 OpenAI API 接受的格式，並傳送給 ChatGPT 進行分析，最後接收分析結果。

## 規格
- **API 端點**: OpenAI Chat Completions API
- **請求方法**: POST
- **核心參數**:
  - `model`: (例如: "gpt-4o", "gpt-3.5-turbo")
  - `messages`: 包含對話記錄的陣列。
  - `response_format`: `{ "type": "json_object" }` 以確保回傳為 JSON。
- **身份驗證**: 使用者在前端設定的 OpenAI API Key。

## 實作步驟
1.  **建立 OpenAI Service**:
    -   在 .NET 6 後端建立一個服務或類別，專門處理與 OpenAI API 的互動。
2.  **組合 Prompt**:
    -   設計一個系統提示 (System Prompt)，指示 ChatGPT 如何分析對話記錄，以及需要回傳的 JSON 格式。
    -   範例 Prompt: "你是一位資料分析專家。請分析以下的對話記錄，並回傳一個 JSON 物件，包含：'most_common_questions' (最常出現的問題列表), 'top_keywords' (前10名關鍵字與次數), 'most_active_users' (單月提問次數最多的使用者)。"
3.  **格式化對話記錄**:
    -   將從 Anything LLM 取得的對話記錄轉換為 OpenAI `messages` 陣列格式。
4.  **發送請求與接收回應**:
    -   使用 `HttpClient` 發送 POST 請求到 OpenAI API。
    -   將使用者提供的 API Key 加入到 HTTP Header 的 `Authorization` 中 (`Bearer YOUR_API_KEY`)。
    -   接收並解析回傳的 JSON 分析結果。
5.  **錯誤處理**:
    -   處理 API Key 無效、請求超時、內容過長等錯誤。

## 驗收標準
-   能夠成功將對話記錄傳送給 ChatGPT。
-   能夠接收到符合指定 JSON 格式的分析結果。
-   能夠處理 API Key 錯誤等常見問題。
