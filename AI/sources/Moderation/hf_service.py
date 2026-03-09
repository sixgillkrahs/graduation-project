from __future__ import annotations

import json
import inspect
import zipfile
from pathlib import Path
from threading import Lock
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MODEL_DIR = ROOT / "models" / "hf-moderation"
DEFAULT_ZIP_PATH = ROOT / "models" / "hf_moderation_model.zip"


def _postprocess_scores(
    scores: dict[str, float],
    threshold: float,
    inappropriate_threshold: float,
    clean_margin: float,
) -> dict[str, Any]:
    clean_score = scores.get("clean", 0.0)
    non_clean_scores = {label: score for label, score in scores.items() if label != "clean"}
    best_non_clean_label = (
        max(non_clean_scores, key=non_clean_scores.get) if non_clean_scores else None
    )
    best_non_clean_score = (
        non_clean_scores[best_non_clean_label] if best_non_clean_label else 0.0
    )

    labels: list[str] = []
    if best_non_clean_label and best_non_clean_score >= inappropriate_threshold:
        if best_non_clean_score > clean_score + clean_margin:
            labels = [
                label
                for label, score in non_clean_scores.items()
                if score >= max(threshold, best_non_clean_score - 0.05)
            ]

    if not labels and clean_score >= threshold - 0.1:
        labels = ["clean"]
    elif not labels and scores:
        labels = [max(scores, key=scores.get)]

    return {
        "threshold": threshold,
        "inappropriate_threshold": inappropriate_threshold,
        "clean_margin": clean_margin,
        "labels": labels,
        "is_inappropriate": any(label != "clean" for label in labels),
    }


class HFModerationService:
    def __init__(
        self,
        model_dir: Path | None = None,
        zip_path: Path | None = None,
    ) -> None:
        self.model_dir = model_dir or DEFAULT_MODEL_DIR
        self.zip_path = zip_path or DEFAULT_ZIP_PATH
        self._bundle: dict[str, Any] | None = None
        self._lock = Lock()

    def _ensure_model_dir(self) -> None:
        if self.model_dir.exists():
            return

        if not self.zip_path.exists():
            raise FileNotFoundError(
                f"Hugging Face moderation zip not found: {self.zip_path}"
            )

        self.model_dir.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(self.zip_path, "r") as archive:
            archive.extractall(self.model_dir)

    def _load_bundle(self) -> dict[str, Any]:
        if self._bundle is not None:
            return self._bundle

        with self._lock:
            if self._bundle is not None:
                return self._bundle

            self._ensure_model_dir()

            try:
                import torch
                from transformers import (
                    AutoModelForSequenceClassification,
                    AutoTokenizer,
                )
            except ImportError as exc:
                raise RuntimeError(
                    "transformers dependencies are not installed. Run pip install -r AI/requirements.txt"
                ) from exc

            metadata_path = self.model_dir / "metadata.json"
            metadata = {}
            if metadata_path.exists():
                metadata = json.loads(metadata_path.read_text(encoding="utf-8"))

            tokenizer = AutoTokenizer.from_pretrained(
                str(self.model_dir),
                local_files_only=True,
            )
            model_kwargs = {
                "local_files_only": True,
            }
            model_signature = inspect.signature(
                AutoModelForSequenceClassification.from_pretrained
            )
            if "low_cpu_mem_usage" in model_signature.parameters:
                model_kwargs["low_cpu_mem_usage"] = True
            if "use_safetensors" in model_signature.parameters:
                model_kwargs["use_safetensors"] = True

            model = AutoModelForSequenceClassification.from_pretrained(
                str(self.model_dir),
                **model_kwargs,
            )
            model.eval()

            self._bundle = {
                "torch": torch,
                "tokenizer": tokenizer,
                "model": model,
                "labels": metadata.get("labels", []),
                "threshold": metadata.get("threshold", 0.5),
                "inappropriate_threshold": metadata.get(
                    "inappropriate_threshold",
                    0.65,
                ),
                "clean_margin": metadata.get("clean_margin", 0.08),
                "max_length": metadata.get("max_length", 128),
                "metadata": metadata,
            }
            return self._bundle

    def available(self) -> bool:
        return self.model_dir.exists() or self.zip_path.exists()

    def status(self) -> dict[str, Any]:
        return {
            "backend": "hf_transformers",
            "model_dir": str(self.model_dir),
            "zip_path": str(self.zip_path),
            "available": self.available(),
        }

    def predict(self, text: str) -> dict[str, Any]:
        bundle = self._load_bundle()
        torch = bundle["torch"]
        tokenizer = bundle["tokenizer"]
        model = bundle["model"]
        labels = bundle["labels"]
        threshold = bundle["threshold"]
        inappropriate_threshold = bundle["inappropriate_threshold"]
        clean_margin = bundle["clean_margin"]
        max_length = bundle["max_length"]

        normalized_text = " ".join(text.lower().strip().split())
        encoded = tokenizer(
            normalized_text,
            truncation=True,
            padding=True,
            max_length=max_length,
            return_tensors="pt",
        )

        with torch.no_grad():
            logits = model(**encoded).logits[0]
            probabilities = torch.sigmoid(logits).cpu().tolist()

        scores = {
            label: round(float(score), 4) for label, score in zip(labels, probabilities)
        }
        postprocessed = _postprocess_scores(
            scores=scores,
            threshold=threshold,
            inappropriate_threshold=inappropriate_threshold,
            clean_margin=clean_margin,
        )

        return {
            "backend": "hf_transformers",
            "text": text,
            "normalized_text": normalized_text,
            "scores": scores,
            **postprocessed,
        }
