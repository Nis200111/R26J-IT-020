import random

from fastapi import APIRouter, UploadFile, File

router = APIRouter()

model = None
model_load_error = None

try:
    # Uncomment when the real trained models are ready:
    # import tensorflow as tf
    # efficientnet_model = tf.keras.models.load_model("app/models/member3/efficientnet_b4.h5")
    # unet_model = tf.keras.models.load_model("app/models/member3/unet.h5")
    pass
except Exception as e:
    model_load_error = str(e)


def mock_predict():
    spread = round(random.random() * 60, 2)
    quality = "High Quality" if spread < 15 else "Medium Quality" if spread < 40 else "Rejected"
    disease = random.choice(["Leaf Spot", "Rust", "Powdery Mildew", "Healthy"])
    return {
        "diseaseName": disease,
        "diseaseSpreadPercent": spread,
        "healthyTissuePercent": round(100 - spread, 2),
        "qualityStatus": quality,
    }


@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None and model_load_error:
        return {"error": True, "message": f"Model unavailable: {model_load_error}"}

    try:
        await file.read()  # validates the upload; replace with real preprocessing once models are loaded
        result = mock_predict()
        return {"error": False, **result}
    except Exception as e:
        return {"error": True, "message": f"Prediction failed: {str(e)}"}
