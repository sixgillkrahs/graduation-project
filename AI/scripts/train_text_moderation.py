import argparse
import csv
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.multiclass import OneVsRestClassifier
from sklearn.pipeline import FeatureUnion, Pipeline
from sklearn.preprocessing import MultiLabelBinarizer


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATASET = ROOT / "data" / "moderation_seed.csv"
DEFAULT_OUTPUT = ROOT / "models" / "moderation"


def normalize_text(text: str) -> str:
    return " ".join(text.lower().strip().split())


def parse_labels(raw: str) -> list[str]:
    return [label.strip() for label in raw.split("|") if label.strip()]


def load_dataset(path: Path) -> tuple[list[str], list[list[str]]]:
    texts: list[str] = []
    labels: list[list[str]] = []

    with path.open("r", encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file)
        for row in reader:
            text = normalize_text(row["text"])
            row_labels = parse_labels(row["labels"])
            if not text or not row_labels:
                continue
            texts.append(text)
            labels.append(row_labels)

    if not texts:
        raise ValueError(f"No usable rows found in dataset: {path}")

    return texts, labels


def build_pipeline() -> Pipeline:
    features = FeatureUnion(
        [
            (
                "word",
                TfidfVectorizer(
                    analyzer="word",
                    ngram_range=(1, 2),
                    min_df=1,
                    max_features=30000,
                    sublinear_tf=True,
                ),
            ),
            (
                "char",
                TfidfVectorizer(
                    analyzer="char_wb",
                    ngram_range=(3, 5),
                    min_df=1,
                    max_features=40000,
                    sublinear_tf=True,
                ),
            ),
        ]
    )

    classifier = OneVsRestClassifier(
        LogisticRegression(
            max_iter=2000,
            class_weight="balanced",
            solver="liblinear",
        )
    )

    return Pipeline(
        [
            ("features", features),
            ("classifier", classifier),
        ]
    )


def evaluate(
    pipeline: Pipeline,
    texts_test: list[str],
    labels_test: np.ndarray,
    class_names: Iterable[str],
) -> dict:
    predictions = pipeline.predict(texts_test)
    report = classification_report(
        labels_test,
        predictions,
        target_names=list(class_names),
        zero_division=0,
        output_dict=True,
    )
    return report


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Train a bilingual text moderation baseline."
    )
    parser.add_argument(
        "--dataset",
        default=str(DEFAULT_DATASET),
        help="CSV file with columns: text, labels",
    )
    parser.add_argument(
        "--output-dir",
        default=str(DEFAULT_OUTPUT),
        help="Directory to save model artifacts",
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=0.45,
        help="Probability threshold for labeling a class as positive",
    )
    args = parser.parse_args()

    dataset_path = Path(args.dataset).resolve()
    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    texts, raw_labels = load_dataset(dataset_path)
    mlb = MultiLabelBinarizer()
    encoded_labels = mlb.fit_transform(raw_labels)

    x_train, x_test, y_train, y_test = train_test_split(
        texts,
        encoded_labels,
        test_size=0.2,
        random_state=42,
    )

    pipeline = build_pipeline()
    pipeline.fit(x_train, y_train)

    metrics = evaluate(pipeline, x_test, y_test, mlb.classes_)
    bundle = {
        "pipeline": pipeline,
        "labels": list(mlb.classes_),
        "threshold": args.threshold,
        "dataset_path": str(dataset_path),
        "train_size": len(x_train),
        "test_size": len(x_test),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    artifact_path = output_dir / "moderation_model.joblib"
    metrics_path = output_dir / "metrics.json"

    joblib.dump(bundle, artifact_path)
    metrics_path.write_text(
        json.dumps(metrics, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    printable = {
        "artifact": str(artifact_path),
        "metrics": str(metrics_path),
        "labels": list(mlb.classes_),
        "train_size": len(x_train),
        "test_size": len(x_test),
        "threshold": args.threshold,
    }
    print(json.dumps(printable, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
