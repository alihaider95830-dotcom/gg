# Quick Start Guide

Get your RAG chatbot running in 5 minutes!

## Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

## Step 2: Set Up API Key

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your API key (choose one):

**For OpenAI:**
```
OPENAI_API_KEY=sk-your-key-here
```

**For OpenRouter:**
```
OPENROUTER_API_KEY=sk-or-your-key-here
```

**For Google Gemini:**
```
GOOGLE_API_KEY=your-gemini-key-here
```

## Step 3: Run the Quick Demo

```bash
python quickstart.py
```

This will:
- Load 50 sample documents from SQuAD
- Set up the vector store
- Run 3 demo questions
- Show you how the system works

## Step 4: (Optional) Ingest More Data

For better results, ingest more data:

```bash
# Ingest 1,000 samples (recommended)
python ingest.py --config balanced --samples 1000

# Or ingest full dataset
python ingest.py --config balanced
```

## Step 5: Start the Web Interface

```bash
python app.py
```

Then open your browser to: **http://localhost:5000**

## You're Ready!

Try asking questions like:
- "What is the capital of France?"
- "Who invented the telephone?"
- "When did World War II end?"

## Configuration Profiles

Choose your profile based on needs:

- `fast` - Quick responses, lower cost
- `balanced` - Good balance (default)
- `accurate` - Best quality, higher cost
- `gemini` - Use Google Gemini

Set in `.env`:
```
CONFIG_PROFILE=balanced
```

## Troubleshooting

**"No documents found"**
→ Run: `python ingest.py --config balanced --samples 1000`

**API key errors**
→ Check your `.env` file has the correct key

**Slow performance**
→ Use `fast` profile or reduce sample count

## Next Steps

- Read [README.md](README.md) for detailed documentation
- Check [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- Run tests with `pytest tests/ -v`

Enjoy your RAG chatbot! 🚀
