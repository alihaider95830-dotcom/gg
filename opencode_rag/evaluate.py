"""
Evaluation script for RAG system using SQuAD metrics.
"""
import argparse
from typing import List, Dict
from datasets import load_dataset
from config_utils import get_configured_pipeline
from tqdm import tqdm
import re


def normalize_answer(s: str) -> str:
    """
    Normalize answer string for comparison.

    Args:
        s: Answer string

    Returns:
        Normalized string
    """
    def remove_articles(text):
        return re.sub(r'\b(a|an|the)\b', ' ', text)

    def white_space_fix(text):
        return ' '.join(text.split())

    def remove_punc(text):
        import string
        exclude = set(string.punctuation)
        return ''.join(ch for ch in text if ch not in exclude)

    def lower(text):
        return text.lower()

    return white_space_fix(remove_articles(remove_punc(lower(s))))


def exact_match_score(prediction: str, ground_truths: List[str]) -> float:
    """
    Calculate exact match score.

    Args:
        prediction: Predicted answer
        ground_truths: List of ground truth answers

    Returns:
        1.0 if exact match, 0.0 otherwise
    """
    prediction = normalize_answer(prediction)
    for ground_truth in ground_truths:
        if normalize_answer(ground_truth) == prediction:
            return 1.0
    return 0.0


def f1_score(prediction: str, ground_truths: List[str]) -> float:
    """
    Calculate F1 score.

    Args:
        prediction: Predicted answer
        ground_truths: List of ground truth answers

    Returns:
        Best F1 score among ground truths
    """
    prediction_tokens = normalize_answer(prediction).split()
    max_f1 = 0.0

    for ground_truth in ground_truths:
        ground_truth_tokens = normalize_answer(ground_truth).split()

        common = set(prediction_tokens) & set(ground_truth_tokens)
        num_same = len(common)

        if num_same == 0:
            continue

        precision = num_same / len(prediction_tokens)
        recall = num_same / len(ground_truth_tokens)
        f1 = (2 * precision * recall) / (precision + recall)
        max_f1 = max(max_f1, f1)

    return max_f1


def context_recall(sources: List[Dict], ground_truth_context: str) -> float:
    """
    Calculate context recall - how well the retrieved contexts match the ground truth.

    Args:
        sources: Retrieved source documents
        ground_truth_context: Ground truth context

    Returns:
        Recall score
    """
    if not sources:
        return 0.0

    ground_truth_words = set(normalize_answer(ground_truth_context).split())
    retrieved_text = " ".join([s['text'] for s in sources])
    retrieved_words = set(normalize_answer(retrieved_text).split())

    if not ground_truth_words:
        return 0.0

    overlap = len(ground_truth_words & retrieved_words)
    return overlap / len(ground_truth_words)


def evaluate(
    config_profile: str = "balanced",
    num_samples: int = 100,
    split: str = "validation",
):
    """
    Evaluate RAG system.

    Args:
        config_profile: Configuration profile
        num_samples: Number of samples to evaluate
        split: Dataset split
    """
    print(f"Loading RAG pipeline with '{config_profile}' profile...")
    pipeline = get_configured_pipeline(config_profile)

    print(f"Loading {num_samples} samples from SQuAD {split} set...")
    dataset = load_dataset("squad_v2", split=split)
    dataset = dataset.select(range(min(num_samples, len(dataset))))

    # Filter out unanswerable questions for this evaluation
    dataset = dataset.filter(lambda x: len(x['answers']['text']) > 0)

    print(f"\nEvaluating on {len(dataset)} samples...\n")

    em_scores = []
    f1_scores = []
    recall_scores = []

    for item in tqdm(dataset):
        question = item['question']
        ground_truth_answers = item['answers']['text']
        ground_truth_context = item['context']

        # Get prediction
        result = pipeline.query(question)
        prediction = result['answer']

        # Calculate metrics
        em = exact_match_score(prediction, ground_truth_answers)
        f1 = f1_score(prediction, ground_truth_answers)
        recall = context_recall(result['sources'], ground_truth_context)

        em_scores.append(em)
        f1_scores.append(f1)
        recall_scores.append(recall)

    # Print results
    print("\n" + "=" * 60)
    print("Evaluation Results")
    print("=" * 60)
    print(f"Configuration: {config_profile}")
    print(f"Samples evaluated: {len(dataset)}")
    print(f"\nMetrics:")
    print(f"  Exact Match:     {sum(em_scores) / len(em_scores):.2%}")
    print(f"  F1 Score:        {sum(f1_scores) / len(f1_scores):.2%}")
    print(f"  Context Recall:  {sum(recall_scores) / len(recall_scores):.2%}")
    print("=" * 60)


def main():
    parser = argparse.ArgumentParser(description="Evaluate RAG system")

    parser.add_argument(
        "--config",
        type=str,
        default="balanced",
        choices=["fast", "balanced", "accurate", "gemini", "default"],
        help="Configuration profile",
    )

    parser.add_argument(
        "--samples",
        type=int,
        default=100,
        help="Number of samples to evaluate",
    )

    parser.add_argument(
        "--split",
        type=str,
        default="validation",
        choices=["train", "validation"],
        help="Dataset split",
    )

    args = parser.parse_args()

    evaluate(
        config_profile=args.config,
        num_samples=args.samples,
        split=args.split,
    )


if __name__ == "__main__":
    main()
