# 工作項目：API 整合 - 串接 Anything LLM 對話記錄 API

## 任務目標
建立後端服務，能夠呼叫 Anything LLM 的 API，並成功獲取指定工作區的對話記錄。

## 規格
- **API 端點**: `https://chat1.baiyuan.io/api/docs/`
- **請求方法**: (需參考 API 文件，假設為 GET)
- **參數**:
  - `workspace`: 法規相關的工作區 (需確認工作區名稱或 ID)
- **身份驗證**: (需參考 API 文件，可能需要 API Key 或 Token)

## 實作步驟
1.  **建立 .NET 6 Web API 專案**:
    -   建立一個新的 Controller (例如 `AnythingLLMController`)。
2.  **建立 API 呼叫邏輯**:
    -   使用 `HttpClient` 或相關套件來發送 HTTP 請求。
    -   建立一個方法，例如 `GetChatLogs(string workspaceName)`。
    -   處理 API 回應，將回傳的 JSON 資料反序列化為 C# 物件。
3.  **設定 API 位址與金鑰**:
    -   將 API 位址和可能的金鑰儲存在 `appsettings.json` 中，避免寫死在程式碼裡。
4.  **錯誤處理**:
    -   處理 API 呼叫失敗的情況（例如：網路錯誤、404 Not Found、401 Unauthorized）。
    -   回傳有意義的錯誤訊息給前端。
5.  **建立前端觸發點**:
    -   在前端頁面建立一個按鈕（例如：「開始分析」），點擊後觸發後端 API 呼叫。

## 驗收標準
-   能夠透過後端 API 成功從 Anything LLM 獲取對話記錄。
-   前端能接收到後端回傳的對話記錄資料。
-   API 位址與金鑰等敏感資訊已設定在配置文件中。
