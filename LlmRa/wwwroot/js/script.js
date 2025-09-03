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
    
    // Analysis result cache
    let cachedAnalysisResult = null;

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
        console.log('Start rendering charts...');
        
        if (!analysisData) {
            console.error('No analysis data provided');
            showError('無法繪製圖表：未收到分析資料');
            return;
        }

        console.log('Rendering charts with data:', analysisData);
        destroyCharts(); // Clear previous charts

        const chartOptions = {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    ticks: { color: '#a0aec0' },
                    grid: { color: '#4a5568' }
                },
                x: {
                    ticks: { 
                        color: '#a0aec0',
                        callback: function(value) {
                            return this.getLabelForValue(value);
                        }
                    },
                    grid: { color: '#4a5568' }
                }
            }
        };

        // 1. Common Questions List
        console.log('Rendering common questions:', analysisData.most_common_questions);
        const questionsContainer = document.getElementById('common-questions-chart').parentElement;
        if (analysisData.most_common_questions && analysisData.most_common_questions.length > 0) {
            questionsContainer.innerHTML = '<h3>最常出現的提問</h3><ol class="question-list"></ol>';
            analysisData.most_common_questions.forEach((question, index) => {
                const li = document.createElement('li');
                li.textContent = question;
                li.className = 'question-item';
                questionsContainer.querySelector('.question-list').appendChild(li);
            });
        } else {
            questionsContainer.innerHTML = '<h3>最常出現的提問</h3><p class="no-data">無資料</p>';
            console.log('No common questions data available');
        }

        // 2. Top Keywords Chart (Bar)
        console.log('Rendering top keywords:', analysisData.top_keywords);
        const keywordsContainer = document.getElementById('top-keywords-chart').parentElement;
        if (analysisData.top_keywords && Object.keys(analysisData.top_keywords).length > 0) {
            const tkCtx = document.getElementById('top-keywords-chart').getContext('2d');
            try {
                const keywords = Object.keys(analysisData.top_keywords);
                const counts = Object.values(analysisData.top_keywords);
                
                // Sort keywords and counts by count in descending order
                const combined = keywords.map((k, i) => ({ keyword: k, count: counts[i] }));
                combined.sort((a, b) => b.count - a.count);
                
                console.log('Preparing chart data:', combined);
                
                topKeywordsChart = createChart(tkCtx, 'bar', {
                    labels: combined.map(item => item.keyword),
                    datasets: [{
                        label: '出現次數',
                        data: combined.map(item => item.count),
                        backgroundColor: '#3182ce',
                    }]
                }, {
                    ...chartOptions,
                    indexAxis: 'y',
                    plugins: {
                        legend: { display: false }
                    }
                });
                console.log('Keywords chart created successfully');
            } catch (error) {
                console.error('Error creating keywords chart:', error);
                keywordsContainer.innerHTML = '<h3>問題關鍵字 Top 10</h3><p class="no-data">圖表繪製失敗</p>';
            }
        } else {
            keywordsContainer.innerHTML = '<h3>問題關鍵字 Top 10</h3><p class="no-data">無資料</p>';
            console.log('No keywords data available');
        }

        // 3. Most Active Users List
        console.log('Rendering active users:', analysisData.most_active_users);
        const usersContainer = document.getElementById('active-users-chart').parentElement;
        if (analysisData.most_active_users && analysisData.most_active_users.length > 0) {
            usersContainer.innerHTML = '<h3>單月提問次數最多使用者</h3><ol class="users-list"></ol>';
            analysisData.most_active_users.forEach((user, index) => {
                const li = document.createElement('li');
                li.textContent = user;
                li.className = 'user-item';
                usersContainer.querySelector('.users-list').appendChild(li);
            });
            console.log('Active users list created successfully');
        } else {
            usersContainer.innerHTML = '<h3>單月提問次數最多使用者</h3><p class="no-data">無資料</p>';
            console.log('No active users data available');
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
            // Check if we have cached analysis result
            if (cachedAnalysisResult) {
                console.log('使用快取的分析結果:', cachedAnalysisResult);
                
                // Just log the usage instead of fetching again
                const logResponse = await fetch('/api/Analysis/log-usage', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'reuse_analysis_result',
                        timestamp: new Date().toISOString(),
                        message: '重複使用快取的 OpenAI 分析結果'
                    })
                });
                
                if (logResponse.ok) {
                    console.log('使用記錄已記錄');
                } else {
                    console.warn('無法記錄使用情況，但繼續執行');
                }
                
                // Directly render charts with cached data
                renderCharts(cachedAnalysisResult);
                updateAnalysisStatus();
                return;
            }

            // Step 1: Get chat logs from AnythingLLM
            console.log('從 AnythingLLM 獲取聊天記錄...');
            const anythingLlmResponse = await fetch('/api/AnythingLLM/chat-logs/ecd0fd9d-9174-4ace-a7d8-b0ce9802231b');
            if (!anythingLlmResponse.ok) {
                throw new Error(`無法從 AnythingLLM 獲取資料: ${anythingLlmResponse.statusText}`);
            }
            const chatLogs = await anythingLlmResponse.text();
            console.log('已獲取聊天記錄');

            // Step 2: Send logs to OpenAI for analysis
            console.log('正在發送資料至 OpenAI 進行分析...');
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
            console.log('OpenAI 分析完成:', analysisJson);
            
            // Step 3: Post the result for validation and storage (optional logging)
            console.log('更新分析結果...');
            const updateResponse = await fetch('/api/Analysis/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(analysisJson)
            });
            if (!updateResponse.ok) {
                console.warn('分析結果更新失敗，但繼續處理:', updateResponse.statusText);
            }

            // Transform the OpenAI data directly for chart rendering
            const transformedData = {
                most_common_questions: analysisJson.most_common_questions || [],
                top_keywords: analysisJson.top_keywords || {},
                most_active_users: analysisJson.most_active_users || []
            };

            console.log('直接使用 OpenAI 結果轉換後的資料:', transformedData);

            // Cache the result for future use
            cachedAnalysisResult = transformedData;
            console.log('分析結果已快取，後續使用將直接載入');
            updateAnalysisStatus();

            // Step 4: Render the charts directly with OpenAI result
            renderCharts(transformedData);

        } catch (error) {
            console.error('分析過程發生錯誤:', error);
            showError(error.message);
        } finally {
            showLoading(false);
        }
    }

    // Function to clear cached analysis result
    function clearAnalysisCache() {
        cachedAnalysisResult = null;
        console.log('分析結果快取已清除');
        updateAnalysisStatus();
    }

    // Function to update analysis status display
    function updateAnalysisStatus() {
        const statusElement = document.getElementById('analysis-status');
        if (statusElement) {
            if (cachedAnalysisResult) {
                statusElement.textContent = '狀態：已有分析結果（使用快取）';
                statusElement.className = 'status-cached';
            } else {
                statusElement.textContent = '狀態：無快取資料';
                statusElement.className = 'status-no-cache';
            }
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

    // Add event listener for clear cache button if it exists
    const clearCacheBtn = document.getElementById('clear-cache-btn');
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', clearAnalysisCache);
    }

    // --- Initial Setup ---
    document.addEventListener('DOMContentLoaded', () => {
        updateApiStatus();
        updateAnalysisStatus();
        destroyCharts(); // Ensure a clean state on load
    });

})();
