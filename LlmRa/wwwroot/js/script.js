// IIFE to encapsulate script
(function () {
    // DOM Elements
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyBtn = document.getElementById('save-api-key-btn');
    const apiStatus = document.getElementById('api-status');
    const startAnalysisBtn = document.getElementById('start-analysis-btn');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorDisplay = document.getElementById('error-display');
    const errorMessage = document.getElementById('error-message');

    // Chart instances
    let commonQuestionsChart, topKeywordsChart, activeUsersChart;

    // --- Helper Functions ---
    function showLoading(isLoading) {
        loadingIndicator.classList.toggle('hidden', !isLoading);
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorDisplay.classList.remove('hidden');
    }

    function hideError() {
        errorDisplay.classList.add('hidden');
    }

    function updateApiStatus() {
        const apiKey = localStorage.getItem('openai_api_key');
        if (apiKey) {
            apiStatus.textContent = '狀態：已連線';
            apiStatus.className = 'status-connected';
            apiKeyInput.value = apiKey;
        } else {
            apiStatus.textContent = '狀態：未連線';
            apiStatus.className = 'status-disconnected';
        }
    }

    // --- Charting Functions ---
    function createChart(ctx, type, data, options) {
        return new Chart(ctx, { type, data, options });
    }

    function destroyCharts() {
        if (commonQuestionsChart) commonQuestionsChart.destroy();
        if (topKeywordsChart) topKeywordsChart.destroy();
        if (activeUsersChart) activeUsersChart.destroy();
    }

    function renderCharts(analysisData) {
        destroyCharts(); // Clear previous charts

        const chartOptions = {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: '#e2e8f0' }
                }
            },
            scales: {
                y: {
                    ticks: { color: '#a0aec0' },
                    grid: { color: '#4a5568' }
                },
                x: {
                    ticks: { color: '#a0aec0' },
                    grid: { color: '#4a5568' }
                }
            }
        };

        // 1. Common Questions Chart (Bar)
        if (analysisData.most_common_questions) {
            const cqCtx = document.getElementById('common-questions-chart').getContext('2d');
            commonQuestionsChart = createChart(cqCtx, 'bar', {
                labels: analysisData.most_common_questions.map((q, i) => `問題 ${i + 1}`),
                datasets: [{
                    label: '最常見問題',
                    data: analysisData.most_common_questions.map(() => Math.floor(Math.random() * 20) + 5), // Using random counts for visualization
                    backgroundColor: '#3182ce',
                }]
            }, chartOptions);
        }

        // 2. Top Keywords Chart (Doughnut)
        if (analysisData.top_keywords) {
            const tkCtx = document.getElementById('top-keywords-chart').getContext('2d');
            const keywords = Object.keys(analysisData.top_keywords);
            const counts = Object.values(analysisData.top_keywords);
            
            topKeywordsChart = createChart(tkCtx, 'doughnut', {
                labels: keywords,
                datasets: [{
                    label: '關鍵字',
                    data: counts,
                    backgroundColor: ['#dd6b20', '#38a169', '#3182ce', '#d53f8c', '#faf089', '#6b46c1', '#f56565', '#4fd1c5', '#f6ad55', '#a0aec0'],
                }]
            }, { ...chartOptions, scales: {} });
        }

        // 3. Active Users Chart (Horizontal Bar)
        if (analysisData.most_active_users) {
            const auCtx = document.getElementById('active-users-chart').getContext('2d');
            activeUsersChart = createChart(auCtx, 'bar', {
                labels: analysisData.most_active_users,
                datasets: [{
                    label: '活躍用戶',
                    data: analysisData.most_active_users.map(() => Math.floor(Math.random() * 20) + 5), // Using random counts for visualization
                    backgroundColor: '#38a169',
                }]
            }, { ...chartOptions, indexAxis: 'y' });
        }
    }

    // --- API Call Functions ---
    async function startAnalysis() {
        hideError();
        showLoading(true);

        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            showError("請先設定您的 OpenAI API Key。");
            showLoading(false);
            return;
        }

        try {
            // Step 1: Get chat logs from AnythingLLM
            // NOTE: Replace 'your-workspace-name' with the actual workspace name
            const anythingLlmResponse = await fetch('/api/AnythingLLM/chat-logs/ecd0fd9d-9174-4ace-a7d8-b0ce9802231b');
            if (!anythingLlmResponse.ok) {
                throw new Error(`無法從 AnythingLLM 獲取資料: ${anythingLlmResponse.statusText}`);
            }
            const chatLogs = await anythingLlmResponse.text();

            // Step 2: Send logs to OpenAI for analysis
            const openAiResponse = await fetch('/api/OpenAi/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-OpenAI-ApiKey': apiKey
                },
                body: JSON.stringify({ textToAnalyze: chatLogs })
            });
            if (!openAiResponse.ok) {
                throw new Error(`OpenAI 分析失敗: ${openAiResponse.statusText}`);
            }
            const analysisJson = await openAiResponse.json();

            // Step 3: Post the result for validation and storage
            const updateResponse = await fetch('/api/Analysis/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(analysisJson)
            });
            if (!updateResponse.ok) {
                throw new Error(`分析結果更新失敗: ${updateResponse.statusText}`);
            }

            // Step 4: Get the final, validated data
            const finalResultResponse = await fetch('/api/Analysis/results');
            if (!finalResultResponse.ok) {
                throw new Error(`無法獲取最終分析結果: ${finalResultResponse.statusText}`);
            }
            const finalData = await finalResultResponse.json();

            // Step 5: Render the charts
            renderCharts(finalData);

        } catch (error) {
            showError(error.message);
        } finally {
            showLoading(false);
        }
    }


    // --- Event Listeners ---
    saveApiKeyBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            localStorage.setItem('openai_api_key', apiKey);
            updateApiStatus();
        }
    });

    startAnalysisBtn.addEventListener('click', startAnalysis);

    // --- Initial Setup ---
    document.addEventListener('DOMContentLoaded', () => {
        updateApiStatus();
        destroyCharts(); // Ensure a clean state on load
    });

})();
