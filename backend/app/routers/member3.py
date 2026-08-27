import io
import os

import numpy as np
from fastapi import APIRouter, UploadFile, File
from PIL import Image

router = APIRouter()

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "member3", "efficientnetb4_v3.keras")
IMG_SIZE = (224, 224)  # Model expects 224x224 input

CLASS_LABELS = ["Anthracnose", "Bacterial_Leaf_Spot", "Healthy", "Rot", "Rust"]

model = None
model_load_error = None

try:
    import tensorflow as tf
    if os.path.exists(MODEL_PATH):
        model = tf.keras.models.load_model(MODEL_PATH)
        print(f"[Member3] Model loaded successfully from {MODEL_PATH}")
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
    # Use EfficientNet's built-in preprocessing (scales to [-1, 1])
    img_array = tf.keras.applications.efficientnet.preprocess_input(img_array)
    img_array = np.expand_dims(img_array, axis=0)  # add batch dimension
    return img_array


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
        }
    except Exception as e:
        return {"error": True, "message": f"Prediction failed: {str(e)}"}
