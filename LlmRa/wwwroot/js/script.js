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
            console.log('Raw API response:', finalData);

            // Transform the data to match the expected format
            const transformedData = {
                most_common_questions: finalData.most_common_questions || [],
                top_keywords: finalData.top_keywords || {},
                most_active_users: finalData.most_active_users || []
            };

            console.log('Transformed data:', transformedData);

            // Step 5: Render the charts
            renderCharts(transformedData);

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
