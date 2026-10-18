import io
import hashlib
import json
import os

import importlib.util

# efficientnetb4_v3.keras is a plain Keras 3 archive, so it runs on any Keras
# backend. TensorFlow is the default and is what this model was trained with,
# but it has no wheel for Python 3.14+ -- there we fall back to torch. Anyone
# can override with KERAS_BACKEND in the environment. Must run before keras is
# imported.
if not os.environ.get("KERAS_BACKEND"):
    for _backend, _module in (("tensorflow", "tensorflow"), ("torch", "torch"), ("jax", "jax")):
        if importlib.util.find_spec(_module) is not None:
            os.environ["KERAS_BACKEND"] = _backend
            break

import numpy as np
from fastapi import APIRouter, UploadFile, File
from PIL import Image, ImageOps, UnidentifiedImageError

router = APIRouter()

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "member3", "efficientnetb4_v3.keras")
IMG_SIZE = (224, 224)  # Model expects 224x224 input

CLASS_LABELS = ["Anthracnose", "Bacterial_Leaf_Spot", "Healthy", "Rot", "Rust"]

model = None
model_load_error = None
keras = None

try:
    try:
        import keras as _keras  # Keras 3, standalone
    except ImportError:  # older setups only have the keras bundled with tensorflow
        from tensorflow import keras as _keras
    keras = _keras
    if os.path.exists(MODEL_PATH):
        model = keras.models.load_model(MODEL_PATH, compile=False)
        print(f"[Member3] Model loaded successfully from {MODEL_PATH} (backend: {keras.backend.backend()})")
    else:
        model_load_error = f"Model file not found at {MODEL_PATH}"
        print(f"[Member3] {model_load_error}")
except Exception as e:
    model_load_error = str(e)
    print(f"[Member3] Failed to load model: {model_load_error}")


GATEKEEPER_DIR = os.path.dirname(os.path.abspath(MODEL_PATH))
GATEKEEPER_PATH = os.path.join(GATEKEEPER_DIR, "gatekeeper_candidate.keras")
GATEKEEPER_CONFIG_PATH = os.path.join(GATEKEEPER_DIR, "inference_config.json")
gatekeeper_model = None
gatekeeper_threshold = None
gatekeeper_load_error = None

try:
    if keras is None:
        raise RuntimeError("Keras is unavailable.")
    with open(GATEKEEPER_CONFIG_PATH, encoding="utf-8-sig") as config_file:
        gatekeeper_config = json.load(config_file)
    threshold = float(gatekeeper_config["threshold"])
    if not np.isfinite(threshold) or not 0 < threshold < 1:
        raise ValueError("Invalid Gatekeeper threshold.")
    if gatekeeper_config["image_size"] != [224, 224]:
        raise ValueError("Unexpected Gatekeeper image size.")
    # The original Colab export has no labels field. This model's sigmoid
    # output is the Valid score (Invalid=0, Valid=1), as used during training.
    if gatekeeper_config.get("labels", {"Invalid": 0, "Valid": 1}) != {"Invalid": 0, "Valid": 1}:
        raise ValueError("Unexpected Gatekeeper label mapping.")
    expected_preprocessing = {
        "orientation": "PIL.ImageOps.exif_transpose",
        "color_mode": "RGB",
        "resize": "PIL bilinear",
        "input_pixel_range": [0, 255],
        "normalization": "Embedded; do not normalize again",
        "decision_rule": "Accept if valid_score >= threshold",
    }
    for setting, expected in expected_preprocessing.items():
        if gatekeeper_config.get(setting) != expected:
            raise ValueError(f"Unsupported Gatekeeper setting: {setting}.")
    with open(GATEKEEPER_PATH, "rb") as model_file:
        actual_sha256 = hashlib.file_digest(model_file, "sha256").hexdigest()
    if actual_sha256 != gatekeeper_config["model_sha256"]:
        raise ValueError("Gatekeeper model does not match its inference settings.")
    candidate = keras.models.load_model(GATEKEEPER_PATH, compile=False)
    if tuple(candidate.input_shape[1:]) != (224, 224, 3):
        raise ValueError("Unexpected Gatekeeper input shape.")
    if tuple(candidate.output_shape[1:]) != (1,):
        raise ValueError("Unexpected Gatekeeper output shape.")
    gatekeeper_threshold = threshold
    gatekeeper_model = candidate
    print(f"[Member3] Gatekeeper loaded (threshold: {threshold}).")
except Exception as e:
    gatekeeper_load_error = str(e)
    print(f"[Member3] Failed to load Gatekeeper: {gatekeeper_load_error}")


def get_gatekeeper_score(image: Image.Image) -> float:
    """Match Colab inference; normalization is embedded in the model."""
    resized = image.resize((224, 224), Image.Resampling.BILINEAR)
    batch = np.expand_dims(np.asarray(resized, dtype=np.float32), axis=0)
    scores = np.asarray(gatekeeper_model.predict(batch, verbose=0)).reshape(-1)
    if scores.size != 1:
        raise ValueError("Unexpected Gatekeeper prediction shape.")
    score = float(scores[0])
    if not np.isfinite(score) or not 0 <= score <= 1:
        raise ValueError("Invalid Gatekeeper prediction.")
    return score


def preprocess_image(image: Image.Image) -> np.ndarray:
    """Resize and preprocess the image for EfficientNetB4 inference."""
    image = image.resize(IMG_SIZE)
    img_array = np.array(image, dtype=np.float32)
    # EfficientNet's preprocessing (rescaling/normalisation lives inside the model)
    img_array = keras.applications.efficientnet.preprocess_input(img_array)
    img_array = np.expand_dims(img_array, axis=0)  # add batch dimension
    return img_array


# ─────────────────────────────────────────────
# Proposed Visual Leaf-Condition Grading
# ─────────────────────────────────────────────
def get_ayurvedic_grade(predicted_class: str, confidence: float) -> dict:
    """
    Proposed Visual Leaf-Condition Grading.
    Maps visual disease classification + confidence into heuristic confidence bands.
    This grade reflects visual leaf condition only and does not certify medicinal quality,
    chemical safety, or pharmacological efficacy.
    """
    if predicted_class == "Healthy":
        if confidence > 0.85:
            return {
                "grade": "A",
                "title": "High-Confidence Healthy Prediction",
                "status": "Healthy Appearance Predicted",
                "description": "This leaf is predicted as healthy with high model confidence (>85%). The 85% cut-off is a heuristic threshold used for confidence banding. This visual prediction does not certify biochemical purity, safety, or medicinal potency.",
                "color": "emerald",
            }
        elif confidence > 0.65:
            return {
                "grade": "B",
                "title": "Moderate-Confidence Healthy Prediction",
                "status": "Healthy Appearance Predicted",
                "description": "This leaf is predicted as healthy with moderate confidence (65%–85%). The 65% threshold is a heuristic cut-off. Manual verification is advised, as visual screening cannot verify medicinal quality or safety.",
                "color": "amber",
            }
        else:
            return {
                "grade": "C",
                "title": "Uncertain Healthy Prediction",
                "status": "Manual Review Required",
                "description": "The model shows low confidence (≤65%) for its healthy prediction. An uncertain prediction requires manual review and expert inspection before any use.",
                "color": "orange",
            }
    else:
        # Disease class predicted (Rust, Rot, Anthracnose, Bacterial Leaf Spot) -> Grade D
        disease_name = predicted_class.replace('_', ' ')
        return {
            "grade": "D",
            "title": f"Disease Predicted — {disease_name}",
            "status": "Disease Predicted — Expert Review Recommended",
            "description": f"Visual disease indicators for {disease_name} were predicted by the model. Physical inspection and expert review are recommended. This visual grade does not evaluate disease severity or biochemical toxicity.",
            "color": "red",
        }


@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    if gatekeeper_model is None:
        return {
            "error": True,
            "code": "GATEKEEPER_UNAVAILABLE",
            "message": "Image validation is unavailable. Please check the Member 3 backend logs.",
        }
    if model is None:
        error_msg = model_load_error or "Model not loaded."
        return {"error": True, "message": f"Model unavailable: {error_msg}"}

    try:
        contents = await file.read()
        with Image.open(io.BytesIO(contents)) as source:
            if getattr(source, "n_frames", 1) != 1:
                raise ValueError("Please upload a single still image.")
            # Transparent backgrounds were not included in Gatekeeper training.
            if "A" in source.getbands() or "transparency" in source.info:
                if source.convert("RGBA").getchannel("A").getextrema()[0] < 255:
                    raise ValueError("Please upload a photo with an opaque background.")
            image = ImageOps.exif_transpose(source).convert("RGB")

        valid_score = get_gatekeeper_score(image)
        gatekeeper_result = {
            "accepted": valid_score >= gatekeeper_threshold,
            "validScore": round(valid_score, 6),
            "threshold": gatekeeper_threshold,
        }
        if not gatekeeper_result["accepted"]:
            return {
                "error": True,
                "code": "UNSUPPORTED_OR_UNCERTAIN_IMAGE",
                "message": (
                    "This image could not be confidently accepted as Aloe vera or Betel. "
                    "Please upload a clear photo of a supported leaf."
                ),
                "gatekeeper": gatekeeper_result,
            }

        img_array = preprocess_image(image)
        prediction = model.predict(img_array, verbose=0)

        # Multi-class classification: 5 classes
        predicted_index = int(np.argmax(prediction[0]))
        predicted_label = CLASS_LABELS[predicted_index]
        confidence = float(prediction[0][predicted_index])
        confidence_pct = round(confidence * 100, 2)

        is_healthy = predicted_label == "Healthy"

        if is_healthy:
            suitability = "Classified as healthy based on visible image features. Visual screening completed; medicinal suitability is not verified."
        else:
            disease_display = predicted_label.replace('_', ' ')
            suitability = f"Visual indicators of {disease_display} detected. Disease Predicted — Expert Review Recommended."

        # Ayurvedic Quality Grading (AMS)
        grade_info = get_ayurvedic_grade(predicted_label, confidence)

        return {
            "error": False,
            "gatekeeper": gatekeeper_result,
            "label": predicted_label,
            "confidence": confidence_pct,
            "suitability": suitability,
            "isHealthy": is_healthy,
            "diseaseName": None if is_healthy else predicted_label.replace("_", " "),
            "allProbabilities": {
                CLASS_LABELS[i]: round(float(prediction[0][i]) * 100, 2)
                for i in range(len(CLASS_LABELS))
            },
            # Novelty: Ayurvedic Quality Grade
            "qualityGrade": grade_info,
        }
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError) as e:
        return {"error": True, "code": "INVALID_IMAGE_OR_PREDICTION", "message": f"Unable to analyze image: {e}"}
    except Exception as e:
        return {"error": True, "message": f"Prediction failed: {str(e)}"}
