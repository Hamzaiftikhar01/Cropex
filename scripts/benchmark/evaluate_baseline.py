#!/usr/bin/env python3
"""
Cropex Phase 2 — VLM Baseline Evaluation Script
================================================
Scores the Groq VLM zero-shot against a labeled test set.

Usage:
    pip install requests pillow tqdm
    set GROQ_API_KEY=gsk_...
    python scripts/benchmark/evaluate_baseline.py \
        --labels scripts/benchmark/labels.json \
        --images-dir scripts/benchmark/images \
        --output scripts/benchmark/results.json

Metrics reported:
    - Top-1 disease accuracy (exact disease_id match)
    - Top-1 crop accuracy (crop_id match)
    - Mean confidence for correct vs incorrect predictions
    - Accuracy by image quality (good / fair / poor)
    - Accuracy by crop
    - Escalation rate (predictions with confidence < 70)
"""

import argparse
import base64
import json
import os
import sys
import time
from pathlib import Path

try:
    import requests
    from tqdm import tqdm
except ImportError:
    print("Install dependencies: pip install requests tqdm")
    sys.exit(1)


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
LOW_CONFIDENCE_THRESHOLD = 70

SYSTEM_PROMPT = (
    "You are Cropex AI, a precision agricultural vision assistant for Pakistan.\n"
    "Analyse the crop image and return ONLY valid JSON with these fields:\n"
    '{ "crop_id": "<wheat|rice|cotton|sugarcane|maize|tomato>", '
    '"disease_id": "<taxonomy_id or healthy or unknown>", '
    '"confidence": <0-100 int> }\n'
    "No markdown, no explanation, raw JSON only."
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def encode_image(path: Path) -> str:
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    ext = path.suffix.lower().lstrip(".")
    mime = {
        "jpg": "image/jpeg", "jpeg": "image/jpeg",
        "png": "image/png", "webp": "image/webp",
    }.get(ext, "image/jpeg")
    return f"data:{mime};base64,{b64}"


def call_vlm(api_key: str, image_data_url: str, crop_hint: str = None) -> dict:
    """Call Groq VLM and return parsed JSON result."""
    hint = f"The crop is {crop_hint}. " if crop_hint else ""
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": [
                {"type": "text", "text": f"{hint}Identify crop and disease. Return JSON."},
                {"type": "image_url", "image_url": {"url": image_data_url}},
            ],
        },
    ]

    resp = requests.post(
        GROQ_API_URL,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={
            "model": GROQ_MODEL,
            "messages": messages,
            "temperature": 0.0,
            "max_tokens": 120,
            "response_format": {"type": "json_object"},
        },
        timeout=60,
    )
    resp.raise_for_status()
    raw = resp.json()["choices"][0]["message"]["content"].strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
    return json.loads(raw)


# ---------------------------------------------------------------------------
# Evaluation loop
# ---------------------------------------------------------------------------

def run_evaluation(labels_path: Path, images_dir: Path, api_key: str):
    with open(labels_path, encoding="utf-8") as f:
        data = json.load(f)

    labels = data.get("labels", [])
    if not labels:
        print("No labels found in labels.json. Add labeled images first.")
        sys.exit(1)

    predictions = []
    errors = []

    for entry in tqdm(labels, desc="Evaluating"):
        img_rel = entry["image_path"].lstrip("/\\")
        img_path = images_dir / img_rel
        if not img_path.exists():
            errors.append({"image_id": entry["image_id"], "error": f"File not found: {img_path}"})
            continue

        try:
            image_data = encode_image(img_path)
            pred = call_vlm(api_key, image_data, crop_hint=entry.get("crop_id"))
            predictions.append({
                "image_id": entry["image_id"],
                "true_crop": entry["crop_id"],
                "true_disease": entry["disease_id"],
                "pred_crop": pred.get("crop_id", "unknown"),
                "pred_disease": pred.get("disease_id", "unknown"),
                "confidence": pred.get("confidence", 0),
                "image_quality": entry.get("image_quality", "unknown"),
                "correct_disease": pred.get("disease_id") == entry["disease_id"],
                "correct_crop": pred.get("crop_id") == entry["crop_id"],
                "needs_escalation": pred.get("confidence", 0) < LOW_CONFIDENCE_THRESHOLD,
            })
        except Exception as e:
            errors.append({"image_id": entry["image_id"], "error": str(e)})

        time.sleep(0.5)  # Respect Groq rate limits

    return predictions, errors


def compute_metrics(predictions: list) -> dict:
    if not predictions:
        return {}

    n = len(predictions)
    correct_disease = sum(1 for p in predictions if p["correct_disease"])
    correct_crop = sum(1 for p in predictions if p["correct_crop"])
    escalated = sum(1 for p in predictions if p["needs_escalation"])
    mean_conf = sum(p["confidence"] for p in predictions) / n

    quality_groups = {}
    for p in predictions:
        q = p.get("image_quality", "unknown")
        quality_groups.setdefault(q, []).append(p["correct_disease"])
    quality_acc = {q: round(sum(v) / len(v) * 100, 1) for q, v in quality_groups.items()}

    crop_groups = {}
    for p in predictions:
        c = p.get("true_crop", "unknown")
        crop_groups.setdefault(c, []).append(p["correct_disease"])
    crop_acc = {c: round(sum(v) / len(v) * 100, 1) for c, v in crop_groups.items()}

    conf_correct = [p["confidence"] for p in predictions if p["correct_disease"]]
    conf_wrong = [p["confidence"] for p in predictions if not p["correct_disease"]]

    target_acc = 85.0
    actual_acc = round(correct_disease / n * 100, 1)
    gap = round(target_acc - actual_acc, 1)

    return {
        "n_images": n,
        "top1_disease_accuracy_pct": actual_acc,
        "top1_crop_accuracy_pct": round(correct_crop / n * 100, 1),
        "escalation_rate_pct": round(escalated / n * 100, 1),
        "mean_confidence": round(mean_conf, 1),
        "mean_confidence_correct": round(sum(conf_correct) / len(conf_correct), 1) if conf_correct else None,
        "mean_confidence_incorrect": round(sum(conf_wrong) / len(conf_wrong), 1) if conf_wrong else None,
        "accuracy_by_quality": quality_acc,
        "accuracy_by_crop": crop_acc,
        "target_disease_accuracy_pct": target_acc,
        "gap_to_target_pct": gap if gap > 0 else 0,
        "meets_target": actual_acc >= target_acc,
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Cropex Phase 2 VLM baseline evaluator")
    parser.add_argument("--labels", required=True, help="Path to labels.json")
    parser.add_argument("--images-dir", required=True, help="Directory containing benchmark images")
    parser.add_argument("--output", default="scripts/benchmark/results.json", help="Output JSON path")
    args = parser.parse_args()

    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        print("ERROR: set GROQ_API_KEY environment variable")
        sys.exit(1)

    labels_path = Path(args.labels)
    images_dir = Path(args.images_dir)

    print(f"Labels:     {labels_path}")
    print(f"Images dir: {images_dir}")
    print(f"Model:      {GROQ_MODEL}")
    print()

    predictions, errors = run_evaluation(labels_path, images_dir, api_key)
    metrics = compute_metrics(predictions)

    output = {
        "model": GROQ_MODEL,
        "evaluated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "metrics": metrics,
        "errors": errors,
        "predictions": predictions,
    }

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print("\n=== RESULTS ===")
    for k, v in metrics.items():
        print(f"  {k}: {v}")

    if errors:
        print(f"\nErrors ({len(errors)}):")
        for e in errors:
            print(f"  {e['image_id']}: {e['error']}")

    print(f"\nFull results saved to {output_path}")


if __name__ == "__main__":
    main()

