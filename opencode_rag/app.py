"""
Flask web application for RAG chatbot.
"""
import os
from flask import Flask, render_template, request, jsonify, session
from dotenv import load_dotenv
from config_utils import get_configured_pipeline
from prometheus_client import Counter, Histogram, generate_latest
import time

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY")
if not app.secret_key:
    if os.getenv("FLASK_ENV") == "development":
        app.secret_key = "dev-secret-key-change-in-production"
    else:
        raise ValueError("No FLASK_SECRET_KEY set for production configuration")

# Initialize RAG pipeline
rag_pipeline = None

# Prometheus metrics
query_counter = Counter("rag_queries_total", "Total number of queries")
query_duration = Histogram("rag_query_duration_seconds", "Query duration")
error_counter = Counter("rag_errors_total", "Total number of errors")


def get_pipeline():
    """Lazy initialization of RAG pipeline."""
    global rag_pipeline
    if rag_pipeline is None:
        rag_pipeline = get_configured_pipeline()
    return rag_pipeline


@app.route("/")
def index():
    """Render main chat interface."""
    return render_template("index.html")


@app.route("/api/query", methods=["POST"])
def query():
    """
    Handle chat query.

    Expected JSON:
        {
            "query": "user question"
        }

    Returns:
        {
            "answer": "generated answer",
            "sources": [...],
            "confidence": 0.85
        }
    """
    try:
        query_counter.inc()
        start_time = time.time()

        data = request.get_json()
        user_query = data.get("query", "").strip()

        if not user_query:
            return jsonify({"error": "Query cannot be empty"}), 400

        # Get or initialize chat history
        if "history" not in session:
            session["history"] = []

        # Process query through RAG pipeline
        pipeline = get_pipeline()
        result = pipeline.query(user_query)

        # Add to history
        session["history"].append({
            "query": user_query,
            "answer": result["answer"],
            "sources": result["sources"],
            "confidence": result["confidence"],
        })
        session.modified = True

        # Record duration
        duration = time.time() - start_time
        query_duration.observe(duration)

        return jsonify(result)

    except Exception as e:
        error_counter.inc()
        app.logger.error(f"Error processing query: {str(e)}", exc_info=True)
        return jsonify({"error": "An internal error occurred processing your query."}), 500


@app.route("/api/history", methods=["GET"])
def get_history():
    """Get chat history for current session."""
    history = session.get("history", [])
    return jsonify({"history": history})


@app.route("/api/clear", methods=["POST"])
def clear_history():
    """Clear chat history."""
    session["history"] = []
    session.modified = True
    return jsonify({"message": "History cleared"})


@app.route("/api/stats", methods=["GET"])
def get_stats():
    """Get system statistics."""
    try:
        pipeline = get_pipeline()
        vector_stats = pipeline.vector_store.get_collection_stats()

        stats = {
            "vector_store": vector_stats,
            "config": {
                "embedding_model": pipeline.config.embedding_model,
                "llm_model": pipeline.config.llm_model,
                "top_k": pipeline.config.top_k,
                "use_reranking": pipeline.config.use_reranking,
            },
            "session": {
                "history_length": len(session.get("history", [])),
            },
        }

        return jsonify(stats)

    except Exception as e:
        app.logger.error(f"Error getting stats: {str(e)}", exc_info=True)
        return jsonify({"error": "An error occurred fetching statistics."}), 500


@app.route("/metrics")
def metrics():
    """Prometheus metrics endpoint."""
    return generate_latest()


@app.route("/health")
def health():
    """Health check endpoint."""
    try:
        pipeline = get_pipeline()
        stats = pipeline.vector_store.get_collection_stats()

        return jsonify({
            "status": "healthy",
            "vector_store_docs": stats["total_documents"],
        })
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": "System is unhealthy",
        }), 503


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV") == "development"

    app.run(host="0.0.0.0", port=port, debug=debug)
