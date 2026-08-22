from fastapi import APIRouter, UploadFile, File
from PIL import Image
import io

router = APIRouter()

MODEL_PATH = "app/models/member1/plant_model.h5"  # place your trained model here

model = None
model_load_error = None

try:
    # Uncomment when the real trained model is ready:
    # import tensorflow as tf
    # model = tf.keras.models.load_model(MODEL_PATH)
    pass
except Exception as e:
    model_load_error = str(e)


def mock_predict(image: Image.Image):
    return {"label": "Getakola", "confidence": 0.92}


@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None and model_load_error:
        return {"error": True, "message": f"Model unavailable: {model_load_error}"}

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        if model is None:
            result = mock_predict(image)
        else:
            # replace with real preprocessing + model.predict(...) once model is loaded
            result = mock_predict(image)

        return {"error": False, **result}
    except Exception as e:
        return {"error": True, "message": f"Prediction failed: {str(e)}"}
