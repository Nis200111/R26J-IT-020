import io
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
from PIL import Image

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
        model = keras.models.load_model(MODEL_PATH)
        print(f"[Member3] Model loaded successfully from {MODEL_PATH} (backend: {keras.backend.backend()})")
    else:
        model_load_error = f"Model file not found at {MODEL_PATH}"
        print(f"[Member3] {model_load_error}")
except Exception as e:
    model_load_error = str(e)
    print(f"[Member3] Failed to load model: {model_load_error}")


def preprocess_image(image: Image.Image) -> np.ndarray:
    """Resize and preprocess the image for EfficientNetB4 inference."""
    image = image.resize(IMG_SIZE)
    img_array = np.array(image, dtype=np.float32)
    # EfficientNet's preprocessing (rescaling/normalisation lives inside the model)
    img_array = keras.applications.efficientnet.preprocess_input(img_array)
    img_array = np.expand_dims(img_array, axis=0)  # add batch dimension
    return img_array


# ─────────────────────────────────────────────
# Ayurvedic Quality Grading (AMS Framework)
# ─────────────────────────────────────────────
def get_ayurvedic_grade(predicted_class: str, confidence: float) -> dict:
    """
    Ayurvedic Medicinal Suitability (AMS) Grading.
    Maps disease classification + confidence to a quality grade
    based on traditional Ayurvedic medicinal production standards.
    """
    if predicted_class == "Healthy":
        if confidence > 0.85:
            return {
                "grade": "A",
                "title": "Premium Medicinal Quality",
                "status": "Approved",
                "description": "This leaf exhibits excellent health with high confidence. Fully suitable for all forms of Ayurvedic medicinal preparations including internal consumption (kashaya, arishtam) and topical applications.",
                "color": "emerald",
            }
        elif confidence > 0.65:
            return {
                "grade": "B",
                "title": "Acceptable Medicinal Quality",
                "status": "Conditional Approval",
                "description": "This leaf appears healthy but with moderate confidence. Recommended for external applications (lepa, taila) and processed preparations (decoction/drying). Manual inspection advised before internal preparations.",
                "color": "amber",
            }
        else:
            return {
                "grade": "C",
                "title": "Uncertain Quality",
                "status": "Manual Review Required",
                "description": "The model shows low confidence in its healthy classification. This leaf requires manual inspection by an experienced Ayurvedic practitioner before any medicinal use.",
                "color": "orange",
            }
    else:
        # Any disease detected (Rust, Rot, Anthracnose, Bacterial Leaf Spot) -> Strictly REJECTED (Grade D)
        disease_name = predicted_class.replace('_', ' ')
        return {
            "grade": "D",
            "title": f"Rejected — {disease_name} Detected",
            "status": "Strictly Rejected",
            "description": f"Infection detected ({disease_name}). In traditional Ayurvedic medicine, leaves with any signs of disease are strictly prohibited for pharmaceutical production to prevent microbial contamination and preserve therapeutic efficacy. Discard immediately.",
            "color": "red",
        }


@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        error_msg = model_load_error or "Model not loaded."
        return {"error": True, "message": f"Model unavailable: {error_msg}"}

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        img_array = preprocess_image(image)
        prediction = model.predict(img_array, verbose=0)

        # Multi-class classification: 5 classes
        predicted_index = int(np.argmax(prediction[0]))
        predicted_label = CLASS_LABELS[predicted_index]
        confidence = float(prediction[0][predicted_index])
        confidence_pct = round(confidence * 100, 2)

        is_healthy = predicted_label == "Healthy"

        if is_healthy:
            suitability = "This leaf is 100% suitable for the production of Ayurvedic medicine."
        else:
            suitability = "This leaf should NOT be used for the production of Ayurvedic medicine."

        # Ayurvedic Quality Grading (AMS)
        grade_info = get_ayurvedic_grade(predicted_label, confidence)

        return {
            "error": False,
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
    except Exception as e:
        return {"error": True, "message": f"Prediction failed: {str(e)}"}
