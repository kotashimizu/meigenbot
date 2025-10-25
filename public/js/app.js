/**
 * WiseTalk - JavaScript Application
 * 偉人の名言チャットボット
 *
 * n8n Webhook API連携
 * API Endpoint: https://n8n.ichi-dify.com/webhook/394837e1-cffc-436e-b568-79404f497be6
 */

// ========================================
// Configuration
// ========================================
const CONFIG = {
    API_URL: 'https://n8n.ichi-dify.com/webhook/394837e1-cffc-436e-b568-79404f497be6',
    ANIMATION_DELAY: 300,
    SCROLL_BEHAVIOR: 'smooth',
    MAX_RETRY: 5,  // 重複時の最大リトライ回数
    STORAGE_KEY: 'wisetalk_displayed_quotes'  // localStorage のキー
};

// ========================================
// DOM Elements
// ========================================
const chatBox = document.getElementById('chatBox');
const quoteButton = document.getElementById('quoteButton');
const loadingIndicator = document.getElementById('loadingIndicator');
const dateDisplay = document.getElementById('dateDisplay');

// ========================================
// State Management
// ========================================
let isLoading = false;
let quoteCount = 0;
let displayedQuotes = new Set();  // 表示済み名言のセット

// ========================================
// LocalStorage Functions
// ========================================

/**
 * Load displayed quotes from localStorage
 */
function loadDisplayedQuotes() {
    try {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (stored) {
            displayedQuotes = new Set(JSON.parse(stored));
            console.log(`Loaded ${displayedQuotes.size} displayed quotes from storage`);
        }
    } catch (error) {
        console.error('Error loading displayed quotes:', error);
        displayedQuotes = new Set();
    }
}

/**
 * Save displayed quotes to localStorage
 */
function saveDisplayedQuotes() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify([...displayedQuotes]));
    } catch (error) {
        console.error('Error saving displayed quotes:', error);
    }
}

/**
 * Add quote to displayed list
 * @param {string} quote - Quote text
 */
function addDisplayedQuote(quote) {
    displayedQuotes.add(quote);
    saveDisplayedQuotes();
}

/**
 * Check if quote was already displayed
 * @param {string} quote - Quote text
 * @returns {boolean}
 */
function isQuoteDisplayed(quote) {
    return displayedQuotes.has(quote);
}

/**
 * Clear all displayed quotes (reset)
 */
function clearDisplayedQuotes() {
    displayedQuotes.clear();
    localStorage.removeItem(CONFIG.STORAGE_KEY);
    console.log('Displayed quotes cleared');
}

// ========================================
// Utility Functions
// ========================================

/**
 * Scroll chat to bottom
 */
function scrollToBottom() {
    const chatContainer = chatBox.parentElement;
    setTimeout(() => {
        chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: CONFIG.SCROLL_BEHAVIOR
        });
    }, 100);
}

/**
 * Create message element
 * @param {string} type - 'user' or 'bot'
 * @param {string} content - Message content
 * @returns {HTMLElement}
 */
function createMessage(type, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';

    // Font Awesomeアイコンを使用
    const icon = document.createElement('i');
    icon.className = type === 'user' ? 'fas fa-user' : 'fas fa-user-tie';
    avatarDiv.appendChild(icon);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = content;

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);

    return messageDiv;
}

/**
 * Add user message to chat
 */
function addUserMessage() {
    const userMessageContent = `
        <div class="message-text">
            今日の名言をください。
        </div>
    `;
    const userMessage = createMessage('user', userMessageContent);
    chatBox.appendChild(userMessage);
    scrollToBottom();
}

/**
 * Add bot message to chat
 * @param {Object} data - Quote data from API
 */
function addBotMessage(data) {
    const botMessageContent = `
        <div class="quote-text">
            "${data.quote}"
        </div>
        <div class="quote-author">
            – ${data.author}
        </div>
        <div class="quote-explanation">
            ${data.explanation}
        </div>
    `;
    const botMessage = createMessage('bot', botMessageContent);
    chatBox.appendChild(botMessage);
    scrollToBottom();
}

/**
 * Add error message to chat
 * @param {string} errorMessage - Error message
 */
function addErrorMessage(errorMessage) {
    const errorContent = `
        <div class="message-text">
            申し訳ございません。エラーが発生しました。<br>
            ${errorMessage}<br>
            もう一度お試しください。
        </div>
    `;
    const errorMsg = createMessage('bot', errorContent);
    chatBox.appendChild(errorMsg);
    scrollToBottom();
}

/**
 * Update date display
 * @param {string} date - Date string
 */
function updateDateDisplay(date) {
    if (date && dateDisplay) {
        dateDisplay.textContent = date;
        dateDisplay.classList.add('visible');
    }
}

/**
 * Show loading state
 */
function showLoading() {
    isLoading = true;
    loadingIndicator.classList.add('active');
    quoteButton.disabled = true;
    quoteButton.querySelector('.button-text').textContent = '読み込み中...';
}

/**
 * Hide loading state
 */
function hideLoading() {
    isLoading = false;
    loadingIndicator.classList.remove('active');
    quoteButton.disabled = false;
    quoteButton.querySelector('.button-text').textContent = '名言をもらう';
}

// ========================================
// API Functions
// ========================================

/**
 * Fetch quote from n8n API
 * @returns {Promise<Object>} Quote data
 */
async function fetchQuote() {
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // n8nが配列を返す場合に対応
        return Array.isArray(data) ? data[0] : data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ========================================
// Main Functions
// ========================================

/**
 * Fetch unique quote (with retry for duplicates)
 * @param {number} retryCount - Current retry count
 * @returns {Promise<Object>} Quote data
 */
async function fetchUniqueQuote(retryCount = 0) {
    const quoteData = await fetchQuote();

    // Validate response data
    if (!quoteData || !quoteData.quote || !quoteData.author) {
        throw new Error('無効なデータ形式です');
    }

    // Check if quote is duplicate
    if (isQuoteDisplayed(quoteData.quote)) {
        console.log(`Duplicate quote detected (retry ${retryCount + 1}/${CONFIG.MAX_RETRY}): "${quoteData.quote}"`);

        // If max retries reached, return anyway
        if (retryCount >= CONFIG.MAX_RETRY) {
            console.warn('Max retries reached. Returning duplicate quote.');
            return quoteData;
        }

        // Wait a bit before retry
        await new Promise(resolve => setTimeout(resolve, 500));

        // Retry
        return fetchUniqueQuote(retryCount + 1);
    }

    return quoteData;
}

/**
 * Get quote - Main function
 */
async function getQuote() {
    // Prevent multiple simultaneous requests
    if (isLoading) {
        return;
    }

    try {
        // Show loading state
        showLoading();

        // Add user message
        addUserMessage();

        // Wait for animation
        await new Promise(resolve => setTimeout(resolve, CONFIG.ANIMATION_DELAY));

        // Fetch unique quote from API (with duplicate check)
        const quoteData = await fetchUniqueQuote();

        // Update date if available
        if (quoteData.date) {
            updateDateDisplay(quoteData.date);
        }

        // Hide loading and show bot message
        hideLoading();

        // Wait for smooth transition
        await new Promise(resolve => setTimeout(resolve, 200));

        // Add bot message
        addBotMessage(quoteData);

        // Save quote to displayed list
        addDisplayedQuote(quoteData.quote);

        // Increment quote count
        quoteCount++;

        console.log(`Total unique quotes displayed: ${displayedQuotes.size}`);

    } catch (error) {
        // Hide loading
        hideLoading();

        // Show error message
        console.error('Error fetching quote:', error);
        addErrorMessage(error.message || '通信エラーが発生しました');
    }
}

// ========================================
// Event Listeners
// ========================================

/**
 * Initialize event listeners
 */
function initEventListeners() {
    // Quote button click
    if (quoteButton) {
        quoteButton.addEventListener('click', getQuote);
    }

    // Enter key on button focus
    if (quoteButton) {
        quoteButton.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                getQuote();
            }
        });
    }

    // Prevent form submission if wrapped in form
    document.addEventListener('submit', (e) => {
        e.preventDefault();
    });
}

// ========================================
// Initialization
// ========================================

/**
 * Initialize application
 */
function init() {
    console.log('WiseTalk initialized');

    // Load displayed quotes from localStorage
    loadDisplayedQuotes();

    // Set up event listeners
    initEventListeners();

    // Optional: Auto-fetch first quote after delay
    // setTimeout(() => {
    //     getQuote();
    // }, 1000);
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ========================================
// Global Error Handler
// ========================================
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
