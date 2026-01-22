// Chat functionality
const chatContainer = document.getElementById('chatContainer');
const queryForm = document.getElementById('queryForm');
const queryInput = document.getElementById('queryInput');
const submitBtn = document.getElementById('submitBtn');
const clearBtn = document.getElementById('clearBtn');
const statsBtn = document.getElementById('statsBtn');
const statsModal = document.getElementById('statsModal');
const closeModal = document.querySelector('.close');

// Initialize
let isProcessing = false;

// Event Listeners
queryForm.addEventListener('submit', handleSubmit);
clearBtn.addEventListener('click', clearChat);
statsBtn.addEventListener('click', showStats);
closeModal.addEventListener('click', () => statsModal.style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === statsModal) {
        statsModal.style.display = 'none';
    }
});

async function handleSubmit(e) {
    e.preventDefault();

    if (isProcessing) return;

    const query = queryInput.value.trim();
    if (!query) return;

    // Clear welcome message if present
    const welcomeMsg = document.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }

    // Add user message
    addMessage(query, 'user');

    // Clear input
    queryInput.value = '';

    // Disable input
    isProcessing = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Thinking...';

    // Add loading message
    const loadingId = addMessage('Searching for relevant information...', 'bot', true);

    try {
        const response = await fetch('/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            throw new Error('Failed to get response');
        }

        const data = await response.json();

        // Remove loading message
        document.getElementById(loadingId).remove();

        // Add bot response
        addBotResponse(data);

    } catch (error) {
        console.error('Error:', error);
        document.getElementById(loadingId).remove();
        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
    } finally {
        isProcessing = false;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send';
        queryInput.focus();
    }
}

function addMessage(text, sender, isLoading = false) {
    const messageDiv = document.createElement('div');
    const id = 'msg-' + Date.now();
    messageDiv.id = id;
    messageDiv.className = `message message-${sender}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;

    if (isLoading) {
        contentDiv.classList.add('loading');
    }

    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);

    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;

    return id;
}

function addBotResponse(data) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message message-bot';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    // Add answer
    const answerP = document.createElement('p');
    answerP.textContent = data.answer;
    contentDiv.appendChild(answerP);

    // Add sources if available
    if (data.sources && data.sources.length > 0) {
        const sourcesDiv = document.createElement('div');
        sourcesDiv.className = 'sources';

        const sourcesTitle = document.createElement('h4');
        sourcesTitle.textContent = '📚 Sources:';
        sourcesDiv.appendChild(sourcesTitle);

        data.sources.forEach(source => {
            const sourceItem = document.createElement('div');
            sourceItem.className = 'source-item';
            sourceItem.innerHTML = `
                <strong>[Context ${source.context_number}]</strong>
                ${source.text}
                <br><small>Score: ${source.score.toFixed(3)}</small>
            `;
            sourcesDiv.appendChild(sourceItem);
        });

        contentDiv.appendChild(sourcesDiv);
    }

    // Add confidence score
    if (data.confidence !== undefined) {
        const confidenceDiv = document.createElement('div');
        confidenceDiv.className = 'confidence';

        let confidenceClass = 'confidence-low';
        if (data.confidence > 0.8) confidenceClass = 'confidence-high';
        else if (data.confidence > 0.5) confidenceClass = 'confidence-medium';

        confidenceDiv.innerHTML = `
            <span class="${confidenceClass}">
                Confidence: ${(data.confidence * 100).toFixed(1)}%
            </span>
        `;
        contentDiv.appendChild(confidenceDiv);
    }

    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);

    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function clearChat() {
    if (!confirm('Clear chat history?')) return;

    try {
        await fetch('/api/clear', { method: 'POST' });
        chatContainer.innerHTML = `
            <div class="welcome-message">
                <h2>Welcome! 👋</h2>
                <p>Ask me anything from the SQuAD dataset. I'll retrieve relevant context and provide accurate answers.</p>
                <div class="example-queries">
                    <p><strong>Try asking:</strong></p>
                    <ul>
                        <li>"What is the capital of France?"</li>
                        <li>"Who invented the telephone?"</li>
                        <li>"When did World War II end?"</li>
                    </ul>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error clearing chat:', error);
        alert('Failed to clear chat');
    }
}

async function showStats() {
    statsModal.style.display = 'block';
    const statsContent = document.getElementById('statsContent');
    statsContent.innerHTML = '<div class="loading">Loading</div>';

    try {
        const response = await fetch('/api/stats');
        const data = await response.json();

        statsContent.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Total Documents</h3>
                    <p>${data.vector_store.total_documents}</p>
                </div>
                <div class="stat-card">
                    <h3>Embedding Model</h3>
                    <p>${data.vector_store.embedding_model}</p>
                </div>
                <div class="stat-card">
                    <h3>LLM Model</h3>
                    <p>${data.config.llm_model}</p>
                </div>
                <div class="stat-card">
                    <h3>Top-K Retrieval</h3>
                    <p>${data.config.top_k}</p>
                </div>
                <div class="stat-card">
                    <h3>Reranking</h3>
                    <p>${data.config.use_reranking ? 'Enabled' : 'Disabled'}</p>
                </div>
                <div class="stat-card">
                    <h3>Session Messages</h3>
                    <p>${data.session.history_length}</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading stats:', error);
        statsContent.innerHTML = '<p>Failed to load statistics</p>';
    }
}
