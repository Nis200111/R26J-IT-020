"""
Member 1 — Medicinal Plant Botanical Authentication.

Endpoints
    GET  /api/member1/health    real model state, not a hardcoded "READY"
    GET  /api/member1/species   the 21 class names in model output order
    POST /api/member1/predict   top-5 prediction, optional Grad-CAM overlay

Model: EfficientNetV2B0 (run02), test accuracy 88.8%, calibrated confidence
threshold 0.81 (89.8% coverage, 95.9% accuracy on accepted at that threshold).

Preprocessing MUST match training exactly: resize to LOAD_SIZE (256) square,
then centre-crop to IMG_SIZE (224). This is different from a plain 224 resize —
EfficientNetV2B0 rescales internally, so feed float32 in [0, 255], do not
divide by 255.

Grad-CAM is disabled for this model. The previous EfficientNetB0 export nested
its backbone as a single sub-model layer, which made it easy to split the
model for Grad-CAM. This EfficientNetV2B0 export is fully unrolled (273 flat
layers), so that split no longer applies. `explainAvailable` in /health
reports this; `explain=true` on /predict is accepted but returns no heatmap.
"""

from __future__ import annotations

import importlib.util
import io
import json
import logging
import os
import time
from pathlib import Path
from typing import Optional

# model_v2_efficientnetv2b0.keras is a plain Keras 3 archive, so it runs on any
# Keras backend. TensorFlow is the default and is what this model was trained
# with, but it has no wheel for Python 3.14+ -- there we fall back to torch.
# Anyone can override with KERAS_BACKEND in the environment. Must run before
# keras is imported, and this router is imported before member3, so the same
# fallback has to live here too.
if not os.environ.get("KERAS_BACKEND"):
    for _backend in ("tensorflow", "torch", "jax"):
        if importlib.util.find_spec(_backend) is not None:
            os.environ["KERAS_BACKEND"] = _backend
            break

import numpy as np
from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError

log = logging.getLogger("member1")
router = APIRouter()

# --------------------------------------------------------------------------- #
# configuration
# --------------------------------------------------------------------------- #
# Resolved relative to THIS file, not the current working directory, so the
# model still loads when uvicorn is started from somewhere other than backend/.
_DEFAULT_MODEL_PATH = (
    Path(__file__).resolve().parent.parent
    / "models" / "member1" / "model_v2_efficientnetv2b0.keras"
)
MODEL_PATH = Path(os.environ.get("MEMBER1_MODEL_PATH", _DEFAULT_MODEL_PATH))
CONFIG_PATH = MODEL_PATH.parent / "calibration.json"

LOAD_SIZE = 256           # resize the whole image to this square first
IMG_SIZE = (224, 224)     # then centre-crop to this — matches training exactly
MAX_UPLOAD_BYTES = 12 * 1024 * 1024
TOP_K = 5

CLASS_NAMES = [
    "Abutilon_indicum", "Andrographis_paniculata", "Boehmeria_nivea", "Boerhavia_diffusa",
    "Catharanthus_roseus", "Datura_metel", "Euphorbia_hirta", "Exallage_auricularia",
    "Gymnema_sylvestre", "Morinda_citrifolia", "Mucuna_pruriens", "Munronia_pinnata",
    "Opuntia_dillenii", "Piper_sarmentosum", "Plectranthus_amboinicus", "Premna_serratifolia",
    "Scoparia_dulcis", "Sida_cordata", "Stachys_sp", "Tephrosia_purpurea", "Thespesia_populnea",
]

# Species pairs the test-set confusion matrix actually shows being mixed up.
# Sida_cordata and Abutilon_indicum are the same error seen from both sides.
# Both are Malvaceae, so the confusion is botanically real.
CONFUSABLE_PAIRS = {
    "Sida_cordata": ["Abutilon_indicum"],
    "Abutilon_indicum": ["Sida_cordata"],
    "Boehmeria_nivea": ["Boerhavia_diffusa"],
}

# CONFIDENCE_HIGH is the one number that's actually calibrated: chosen on the
# validation split to target 95% accuracy on accepted predictions (run02,
# section 14) — 0.81 gives 89.8% coverage and 95.9% accuracy on test.
# CONFIDENCE_LOW / MARGIN_LOW are uncalibrated, reasonable defaults for the
# "moderate" tier. All three are overridden if calibration.json exists.
CONFIDENCE_HIGH = 0.81
CONFIDENCE_LOW = 0.40
MARGIN_LOW = 0.15

# --------------------------------------------------------------------------- #
# load once
# --------------------------------------------------------------------------- #
model = None
grad_model = None
model_load_error: Optional[str] = None
_explain_available = False
_loaded_at = None

try:
    import base64
    import cv2
    import keras
    import tensorflow as tf

    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"no model at {MODEL_PATH.resolve()}")

    model = keras.models.load_model(MODEL_PATH)

    n_out = int(model.output_shape[-1])
    if n_out != len(CLASS_NAMES):
        raise ValueError(f"model has {n_out} outputs, CLASS_NAMES has {len(CLASS_NAMES)}")

    try:
        last_conv = model.get_layer("top_conv")
        grad_model = tf.keras.models.Model(inputs=model.inputs, outputs=[last_conv.output, model.output])
        _explain_available = True
    except Exception as e:
        log.warning("Grad-CAM submodel initialization skipped: %s", e)

    if CONFIG_PATH.exists():
        _cfg = json.loads(CONFIG_PATH.read_text())
        CONFIDENCE_HIGH = float(_cfg.get("confidence_high", CONFIDENCE_HIGH))
        CONFIDENCE_LOW = float(_cfg.get("confidence_low", CONFIDENCE_LOW))
        MARGIN_LOW = float(_cfg.get("margin_low", MARGIN_LOW))
        log.info("loaded calibrated thresholds from %s", CONFIG_PATH)

    # Warm up — tracing the graph costs a couple of seconds on CPU and you do
    # not want that happening on the first request of a live demo.
    _warm = np.zeros((*IMG_SIZE, 3), "float32")
    model.predict(_warm[None], verbose=0)

    _loaded_at = time.strftime("%Y-%m-%d %H:%M:%S")
    log.info("member1 model ready: %s", MODEL_PATH)

except Exception as exc:                                   # noqa: BLE001
    model_load_error = f"{type(exc).__name__}: {exc}"
    log.error("member1 model failed to load: %s", model_load_error)


# --------------------------------------------------------------------------- #
# preprocessing — must match training exactly
# --------------------------------------------------------------------------- #
def preprocess(raw: bytes) -> np.ndarray:
    try:
        im = Image.open(io.BytesIO(raw))
        im.load()
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(400, f"Not a readable image file: {exc}") from exc

    im = ImageOps.exif_transpose(im).convert("RGB")        # honour phone rotation
    im = im.resize((LOAD_SIZE, LOAD_SIZE), Image.BILINEAR)

    off = (LOAD_SIZE - IMG_SIZE[0]) // 2
    im = im.crop((off, off, off + IMG_SIZE[0], off + IMG_SIZE[1]))

    return np.asarray(im, dtype="float32")


def compute_gradcam(arr: np.ndarray, pred_index: int) -> Optional[str]:
    if grad_model is None:
        return None
    try:
        import base64
        import cv2
        import tensorflow as tf

        inp = np.expand_dims(arr, axis=0)
        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(inp)
            loss = predictions[:, pred_index]

        grads = tape.gradient(loss, conv_outputs)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        conv_outputs = conv_outputs[0]
        heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)
        heatmap = tf.maximum(heatmap, 0)
        max_val = tf.math.reduce_max(heatmap)
        if max_val > 0:
            heatmap = heatmap / max_val
        heatmap_np = heatmap.numpy()

        heatmap_resized = cv2.resize(heatmap_np, (IMG_SIZE[0], IMG_SIZE[1]))
        heatmap_uint8 = np.uint8(255 * heatmap_resized)
        color_heatmap = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)

        img_uint8 = np.uint8(np.clip(arr, 0, 255))
        superimposed = cv2.addWeighted(img_uint8, 0.6, color_heatmap, 0.4, 0)

        _, buffer = cv2.imencode('.png', cv2.cvtColor(superimposed, cv2.COLOR_BGR2RGB))
        encoded = base64.b64encode(buffer).decode('utf-8')
        return f"data:image/png;base64,{encoded}"
    except Exception as exc:
        log.warning("Failed to compute Grad-CAM heatmap: %s", exc)
        return None


# --------------------------------------------------------------------------- #
# prediction
# --------------------------------------------------------------------------- #
def run_prediction(arr: np.ndarray, tta: bool = False, explain: bool = False) -> dict:
    batch = np.stack([arr, arr[:, ::-1, :]]) if tta else arr[None, ...]
    probs = model.predict(batch, verbose=0).mean(axis=0)

    order = np.argsort(-probs)[:TOP_K]
    ranked = [{"label": CLASS_NAMES[i],
               "name": CLASS_NAMES[i].replace("_", " "),
               "confidence": round(float(probs[i]), 4)}
              for i in order]

    top1, top2 = ranked[0], ranked[1]
    margin = round(top1["confidence"] - top2["confidence"], 4)

    if top1["confidence"] < CONFIDENCE_LOW:
        status = "low"
    elif top1["confidence"] < CONFIDENCE_HIGH or margin < MARGIN_LOW:
        status = "moderate"
    else:
        status = "high"

    confusable_with = None
    if top2["label"] in CONFUSABLE_PAIRS.get(top1["label"], []):
        confusable_with = top2["label"]

    result = {
        "label": top1["label"],
        "name": top1["name"],
        "confidence": top1["confidence"],
        "secondLabel": top2["label"],
        "secondName": top2["name"],
        "secondConfidence": top2["confidence"],
        "margin": margin,
        "status": status,
        "confusableWith": confusable_with,
        "predictions": ranked,
        "thresholds": {"high": CONFIDENCE_HIGH, "low": CONFIDENCE_LOW, "margin": MARGIN_LOW},
        "tta": tta,
    }

    if explain and _explain_available:
        result["heatmap"] = compute_gradcam(arr, order[0])
    else:
        result["heatmap"] = None

    return result


# --------------------------------------------------------------------------- #
# routes
# --------------------------------------------------------------------------- #
@router.get("/health")
def health():
    return {
        "status": "ok" if model is not None else "model_unavailable",
        "model": MODEL_PATH.name,
        "modelLoadedAt": _loaded_at,
        "error": model_load_error,
        "classes": len(CLASS_NAMES),
        "explainAvailable": _explain_available,
        "calibrated": CONFIG_PATH.exists(),
        "thresholds": {"high": CONFIDENCE_HIGH, "low": CONFIDENCE_LOW, "margin": MARGIN_LOW},
    }


@router.get("/species")
def species():
    return {
        "count": len(CLASS_NAMES),
        "species": [
            {"index": i, "label": n, "name": n.replace("_", " "),
             "confusableWith": CONFUSABLE_PAIRS.get(n, [])}
            for i, n in enumerate(CLASS_NAMES)
        ],
    }


@router.post("/predict")
async def predict(
    file: UploadFile = File(...),
    tta: bool = Query(False, description="Average over the image and its mirror."),
    explain: bool = Query(False, description="Reserved — no heatmap for this model export."),
):
    if model is None:
        raise HTTPException(503, f"Identification model unavailable: {model_load_error}")

    raw = await file.read()
    if not raw:
        raise HTTPException(400, "Empty upload")
    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, f"Image exceeds {MAX_UPLOAD_BYTES // (1024 * 1024)} MB")

    started = time.perf_counter()
    result = run_prediction(preprocess(raw), tta=tta, explain=explain)
    result["elapsedMs"] = round((time.perf_counter() - started) * 1000, 1)
    return {"error": False, **result}
