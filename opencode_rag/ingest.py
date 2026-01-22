"""
CLI script to ingest SQuAD data into vector store.
"""
import argparse
from tqdm import tqdm
from config import get_config
from config_utils import create_vector_store
from data_loader import DataLoader


def ingest_data(
    config_profile: str = "balanced",
    num_samples: int = None,
    split: str = "train",
):
    """
    Ingest SQuAD data into vector store.

    Args:
        config_profile: Configuration profile to use
        num_samples: Number of samples to ingest (None for all)
        split: Dataset split to use
    """
    print(f"Loading configuration profile: {config_profile}")
    config = get_config(config_profile)

    print(f"Initializing vector store with {config.embedding_model}")
    vector_store = create_vector_store(config)

    print(f"Loading SQuAD dataset ({split} split)")
    data_loader = DataLoader(
        chunk_size=config.chunk_size,
        chunk_overlap=config.chunk_overlap,
        use_token_chunking=config.use_token_chunking,
    )

    documents = data_loader.prepare_for_ingestion(
        split=split,
        num_samples=num_samples,
    )

    print(f"Ingesting {len(documents)} document chunks...")

    # Batch ingestion for efficiency
    batch_size = 100
    for i in tqdm(range(0, len(documents), batch_size)):
        batch = documents[i : i + batch_size]

        texts = [doc["text"] for doc in batch]
        metadatas = [doc["metadata"] for doc in batch]

        vector_store.add_documents(
            texts=texts,
            metadatas=metadatas,
        )

    stats = vector_store.get_collection_stats()
    print(f"\n[OK] Ingestion complete!")
    print(f"  Total documents: {stats['total_documents']}")
    print(f"  Embedding model: {stats['embedding_model']}")
    print(f"  Collection: {stats['collection_name']}")


def main():
    parser = argparse.ArgumentParser(description="Ingest SQuAD data into vector store")

    parser.add_argument(
        "--config",
        type=str,
        default="balanced",
        choices=["fast", "balanced", "accurate", "gemini", "default"],
        help="Configuration profile to use",
    )

    parser.add_argument(
        "--samples",
        type=int,
        default=None,
        help="Number of samples to ingest (default: all)",
    )

    parser.add_argument(
        "--split",
        type=str,
        default="train",
        choices=["train", "validation"],
        help="Dataset split to use",
    )

    args = parser.parse_args()

    ingest_data(
        config_profile=args.config,
        num_samples=args.samples,
        split=args.split,
    )


if __name__ == "__main__":
    main()
