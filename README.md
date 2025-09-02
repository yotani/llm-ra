# Anything LLM 對話記錄分析儀表板

這是一個 Web 應用程式，旨在分析來自 Anything LLM 特定工作區的對話記錄。它利用 OpenAI API 從對話中提取洞見，並在一個互動式儀表板上以圖表方式將數據視覺化。

## ✨ 功能特色

-   從 Anything LLM API 獲取對話記錄。
-   使用 OpenAI 的 GPT 模型進行智慧分析。
-   視覺化呈現最常見的問題、熱門關鍵字和最活躍的使用者。
-   透過使用者介面安全地設定和儲存 OpenAI API Key。
-   基於 .NET 6 的後端和原生 HTML/CSS/JS 的輕量級前端。

## 🛠️ 環境需求

-   [.NET 6 SDK](https://dotnet.microsoft.com/download/dotnet/6.0)

## ⚙️ 設定與組態

在執行專案之前，您需要進行以下設定：

1.  **後端設定**:
    -   開啟 `LlmRa/appsettings.json` 檔案。
    -   將 `AnythingLLM.ApiUrl` 設定為您 Anything LLM 實例的 API 位址。
    -   將 `AnythingLLM.ApiKey` 設定為您 Anything LLM 的 API 金鑰。

2.  **前端設定**:
    -   在專案啟動後，於瀏覽器中開啟應用程式。
    -   在「AI 專家建議 API 配置」區塊中，輸入您的 OpenAI API Key，然後點擊「儲存金鑰」。金鑰將被安全地儲存在您的瀏覽器中。

3.  **工作區名稱設定**:
    -   開啟 `LlmRa/wwwroot/js/script.js` 檔案。
    -   找到以下這行程式碼：
        ```javascript
        const anythingLlmResponse = await fetch('/api/AnythingLLM/chat-logs/your-workspace-name');
        ```
    -   將 `your-workspace-name` 替換為您想要分析的實際工作區名稱。

## 🚀 如何啟動

1.  開啟一個新的終端機。
2.  使用 `cd` 指令進入後端專案目錄：
    ```sh
    cd LlmRa
    ```
3.  執行 `dotnet run` 指令來啟動應用程式：
    ```sh
    dotnet run
    ```
4.  應用程式啟動後，終端機將顯示正在監聽的 URL (例如 `https://localhost:5001`)。
5.  在您的瀏覽器中開啟該 URL 即可看到應用程式介面。

## 📂 專案結構

```
.
├── docs/              # 包含所有專案規劃與任務文件
├── LlmRa/             # .NET 6 Web API 專案
│   ├── Controllers/   # API 控制器
│   ├── Models/        # C# 資料模型
│   ├── wwwroot/       # 所有前端靜態檔案 (HTML, CSS, JS)
│   ├── appsettings.json # 後端設定檔
│   └── LlmRa.csproj   # .NET 專案檔
└── README.md          # 本說明文件
```
