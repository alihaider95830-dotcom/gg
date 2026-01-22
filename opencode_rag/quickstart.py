"""
Quick start demo script with a small sample of data.
"""
from config import get_config
from config_utils import create_vector_store, create_rag_pipeline
from data_loader import DataLoader


def main():
    """Run a quick demo with 50 samples."""
    print("=" * 60)
    print("RAG Chatbot Quick Start Demo")
    print("=" * 60)

    # Use fast configuration for quick demo
    print("\n1. Loading configuration (fast profile)...")
    config = get_config("fast")

    # Initialize vector store
    print("2. Initializing vector store...")
    vector_store = create_vector_store(config)

    # Check if data already exists
    stats = vector_store.get_collection_stats()
    if stats["total_documents"] > 0:
        print(f"   [OK] Found existing data ({stats['total_documents']} documents)")
    else:
        print("3. Loading 50 sample documents from SQuAD...")
        data_loader = DataLoader(
            chunk_size=config.chunk_size,
            chunk_overlap=config.chunk_overlap,
            use_token_chunking=config.use_token_chunking,
        )

        documents = data_loader.prepare_for_ingestion(
            split="train",
            num_samples=50,
        )

        print(f"4. Ingesting {len(documents)} document chunks...")
        texts = [doc["text"] for doc in documents]
        metadatas = [doc["metadata"] for doc in documents]

        vector_store.add_documents(texts=texts, metadatas=metadatas)
        print("   [OK] Data ingested successfully!")

    # Initialize RAG pipeline
    print("\n5. Initializing RAG pipeline...")
    rag_pipeline = create_rag_pipeline(config)

    # Demo queries
    print("\n" + "=" * 60)
    print("Demo Questions")
    print("=" * 60)

    demo_queries = [
        "What is a region in France?",
        "Who developed the theory of relativity?",
        "What is the capital of England?",
    ]

    for i, query in enumerate(demo_queries, 1):
        print(f"\n[Q{i}] {query}")
        print("-" * 60)

        result = rag_pipeline.query(query)

        print(f"Answer: {result['answer']}")
        print(f"\nConfidence: {result['confidence']:.2%}")
        print(f"Sources used: {result['retrieval_count']}")

        if result['sources']:
            print("\nTop Source:")
            source = result['sources'][0]
            preview = source['text'][:150] + "..." if len(source['text']) > 150 else source['text']
            print(f"  {preview}")

    print("\n" + "=" * 60)
    print("Demo Complete!")
    print("=" * 60)
    print("\nTo run the web interface:")
    print("  python app.py")
    print("\nThen visit: http://localhost:5000")


if __name__ == "__main__":
    main()
