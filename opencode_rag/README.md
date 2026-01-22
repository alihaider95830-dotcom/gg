# RAG Chatbot with SQuAD Dataset

A production-ready Retrieval-Augmented Generation (RAG) chatbot system built with Python/Flask. Uses the SQuAD 2.0 dataset as its knowledge base to provide accurate, grounded answers with citation tracking.

## Features

- **Retrieval-Augmented Generation**: Combines semantic search with LLM generation
- **Citation Tracking**: All answers include source references with [Context N] markers
- **Hallucination Prevention**: Grounding verification ensures answers align with retrieved context
- **Multi-LLM Support**: Works with OpenAI, OpenRouter, DeepSeek, and Google Gemini
- **Configurable Profiles**: Pre-tuned configurations for different use cases (fast, balanced, accurate)
- **Web Interface**: Clean, modern chat UI with real-time statistics
- **Vector Search**: ChromaDB with semantic embeddings and optional CrossEncoder reranking
- **Session Management**: Maintains chat history per session
- **Metrics & Monitoring**: Prometheus metrics and health check endpoints

## Architecture

```
User Query → Flask API → RAG Pipeline:
  1. RETRIEVE: Vector search (ChromaDB + embeddings)
  2. COMPRESS: Context optimization to fit token limits
  3. GENERATE: LLM generates answer from context
  4. VERIFY: Grounding check (70%+ word overlap)
→ Return answer + sources + confidence score
```

### Core Components

- **app.py** - Flask web server with REST API
- **rag_pipeline.py** - RAG orchestration
- **vector_store.py** - ChromaDB wrapper with embeddings
- **data_loader.py** - SQuAD dataset processing
- **config.py** - Configuration profiles
- **config_utils.py** - Factory functions for component creation

## Installation

### Prerequisites

- Python 3.8+
- pip

### Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd opencode_rag
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Configure environment variables**
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your API key (choose one):
# - OPENAI_API_KEY=sk-...
# - OPENROUTER_API_KEY=sk-...
# - GOOGLE_API_KEY=...
```

4. **Ingest data**
```bash
# Ingest 1000 samples from SQuAD (recommended for testing)
python ingest.py --config balanced --samples 1000

# Or ingest full dataset
python ingest.py --config balanced
```

5. **Run the application**
```bash
python app.py
```

Visit http://localhost:5000 to use the chat interface.

## Quick Start

Run the demo with 50 samples:

```bash
python quickstart.py
```

This will:
1. Load 50 SQuAD samples
2. Create a vector store
3. Run 3 demo queries
4. Show answers with sources and confidence scores

## Configuration Profiles

Choose a profile based on your needs:

| Profile | Embedding Model | Chunk Size | LLM | Top-K | Use Case |
|---------|----------------|------------|-----|-------|----------|
| **fast** | MiniLM-L6-v2 | 300 | gpt-3.5-turbo | 2 | Quick responses, lower cost |
| **balanced** | MiniLM-L6-v2 | 500 | gpt-3.5-turbo | 3 | Default, good trade-off |
| **accurate** | mpnet-base-v2 | 700 | gpt-4 | 5 | Best quality, higher cost |
| **gemini** | MiniLM-L6-v2 | 500 | gemini-1.5-flash | 3 | Google Gemini provider |

Set profile in `.env`:
```
CONFIG_PROFILE=balanced
```

Or specify when ingesting:
```bash
python ingest.py --config accurate --samples 5000
```

## API Endpoints

### POST /api/query
Main chat endpoint. Send questions and receive answers with sources.

**Request:**
```json
{
  "query": "What is the capital of France?"
}
```

**Response:**
```json
{
  "answer": "Paris is the capital of France.",
  "sources": [
    {
      "context_number": 1,
      "text": "Paris is the capital and most populous city of France...",
      "metadata": {...},
      "score": 0.89
    }
  ],
  "confidence": 0.85,
  "retrieval_count": 3
}
```

### GET /api/history
Get chat history for current session.

### POST /api/clear
Clear chat history.

### GET /api/stats
Get system statistics (vector store size, config, etc.).

### GET /metrics
Prometheus metrics endpoint.

### GET /health
Health check endpoint.

## Usage Examples

### Python API

```python
from config_utils import get_configured_pipeline

# Initialize pipeline
pipeline = get_configured_pipeline(profile="balanced")

# Ask a question
result = pipeline.query("Who invented the telephone?")

print(result["answer"])
print(f"Confidence: {result['confidence']:.2%}")

for source in result["sources"]:
    print(f"[Context {source['context_number']}]: {source['text'][:100]}...")
```

### Command Line

```bash
# Ingest data
python ingest.py --config balanced --samples 1000

# Run evaluation
python evaluate.py --config balanced --samples 100

# Start web server
python app.py
```

## Evaluation

Evaluate the system using SQuAD metrics:

```bash
python evaluate.py --config balanced --samples 100
```

Metrics:
- **Exact Match**: Percentage of exact answer matches
- **F1 Score**: Token-level overlap between prediction and ground truth
- **Context Recall**: How well retrieved contexts match ground truth context

## Testing

Run the test suite:

```bash
# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/test_vector_store.py -v

# Run with coverage
pip install pytest-cov
pytest tests/ --cov=. --cov-report=html
```

Test coverage includes:
- Smoke tests for configurations
- Vector store operations
- RAG pipeline logic
- Data loading and chunking

## Deployment

### Local Development
```bash
FLASK_ENV=development python app.py
```

### Production (Gunicorn)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Docker
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

### Vercel
The application is Vercel-ready. Add `vercel.json`:

```json
{
  "builds": [
    {
      "src": "app.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app.py"
    }
  ]
}
```

## Project Structure

```
opencode_rag/
├── app.py                 # Flask web application
├── rag_pipeline.py        # RAG orchestration
├── vector_store.py        # ChromaDB wrapper
├── data_loader.py         # SQuAD data processing
├── config.py              # Configuration profiles
├── config_utils.py        # Component factory
├── ingest.py              # Data ingestion CLI
├── quickstart.py          # Quick demo script
├── evaluate.py            # Evaluation metrics
├── requirements.txt       # Python dependencies
├── .env.example           # Environment template
├── pytest.ini             # Pytest configuration
├── templates/
│   └── index.html        # Chat UI template
├── static/
│   ├── css/
│   │   └── style.css     # Styles
│   └── js/
│       └── chat.js       # Frontend logic
└── tests/
    ├── test_smoke.py      # Basic tests
    ├── test_vector_store.py
    ├── test_rag_pipeline.py
    └── test_data_loader.py
```

## Troubleshooting

### Issue: Vector store is empty
```bash
# Re-ingest data
python ingest.py --config balanced --samples 1000
```

### Issue: API key errors
```bash
# Verify .env file has correct key
cat .env | grep API_KEY

# Test with quickstart
python quickstart.py
```

### Issue: Slow performance
- Use `fast` profile for quicker responses
- Reduce `--samples` during ingestion
- Disable reranking in config

### Issue: Low accuracy
- Use `accurate` profile
- Increase `top_k` in config
- Enable reranking
- Ingest more data samples

## Advanced Configuration

### Custom Configuration

```python
from config import RAGConfig

custom_config = RAGConfig(
    embedding_model="all-mpnet-base-v2",
    chunk_size=600,
    top_k=4,
    use_reranking=True,
    llm_provider="openai",
    llm_model="gpt-4-turbo",
    max_context_length=2500,
)
```

### Custom System Prompt

```python
config.system_prompt = """You are an expert assistant specializing in history.
Use only the provided context to answer questions.
Always cite your sources using [Context N] markers."""
```

## Performance Tuning

- **Speed**: Use `fast` profile, reduce top_k, disable reranking
- **Accuracy**: Use `accurate` profile, increase top_k, enable reranking
- **Cost**: Use gpt-3.5-turbo or gemini-1.5-flash models
- **Quality**: Use gpt-4 with higher top_k and reranking

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Built with [ChromaDB](https://www.trychroma.com/)
- Embeddings from [Sentence Transformers](https://www.sbert.net/)
- Dataset: [SQuAD 2.0](https://rajpurkar.github.io/SQuAD-explorer/)
- LLM providers: OpenAI, OpenRouter, Google Gemini
