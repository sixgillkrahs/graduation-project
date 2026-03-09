from __future__ import annotations

from pathlib import Path
from threading import Lock
from typing import Any

import joblib

from sources.Moderation.hf_service import HFModerationService, _postprocess_scores


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_ARTIFACT = ROOT / "models" / "moderation" / "moderation_model.joblib"


class ModerationService:
    def __init__(self, artifact_path: Path | None = None) -> None:
        self.artifact_path = artifact_path or DEFAULT_ARTIFACT
        self._bundle: dict[str, Any] | None = None
        self._lock = Lock()
        self.hf_service = HFModerationService()

    def _load_bundle(self) -> dict[str, Any]:
        if self._bundle is not None:
            return self._bundle

        with self._lock:
            if self._bundle is None:
                if not self.artifact_path.exists():
                    raise FileNotFoundError(
                        f"Moderation artifact not found: {self.artifact_path}"
                    )
                self._bundle = joblib.load(self.artifact_path)
        return self._bundle

    def status(self) -> dict[str, Any]:
        active_backend = (
            "hf_transformers"
            if self.hf_service.available()
            else "sklearn_joblib" if self.artifact_path.exists() else None
        )
        return {
            "active_backend": active_backend,
            "artifact_path": str(self.artifact_path),
            "loaded": self.artifact_path.exists() or self.hf_service.available(),
            "sklearn_available": self.artifact_path.exists(),
            "hf_available": self.hf_service.available(),
            "hf_model_dir": str(self.hf_service.model_dir),
            "hf_zip_path": str(self.hf_service.zip_path),
        }

    def predict(self, text: str) -> dict[str, Any]:
        if self.hf_service.available():
            return self.hf_service.predict(text)

        bundle = self._load_bundle()
        pipeline = bundle["pipeline"]
        labels = bundle["labels"]
        threshold = bundle.get("threshold", 0.45)
        clean_margin = bundle.get("clean_margin", 0.08)
        inappropriate_threshold = bundle.get(
            "inappropriate_threshold",
            min(0.7, threshold + 0.15),
        )

        normalized_text = " ".join(text.lower().strip().split())
        probabilities = pipeline.predict_proba([normalized_text])[0]
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
            "backend": "sklearn_joblib",
            "text": text,
            "normalized_text": normalized_text,
            "scores": scores,
            **postprocessed,
        }


moderation_service = ModerationService()
