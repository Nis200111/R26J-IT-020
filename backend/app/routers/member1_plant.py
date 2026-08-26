import io

import numpy as np
from fastapi import APIRouter, UploadFile, File
from PIL import Image

router = APIRouter()

MODEL_PATH = "app/models/member1/plant_model_finetuned_best.keras"
IMG_SIZE = (224, 224)

# Order matters — this is the class order TensorFlow's image_dataset_from_directory
# produced during training (alphabetical by folder name). Must match the model's output layer.
CLASS_NAMES = [
    "Abutilon_indicum", "Andrographis_paniculata", "Boehmeria_nivea", "Boerhavia_diffusa",
    "Catharanthus_roseus", "Datura_metel", "Euphorbia_hirta", "Exallage_auricularia",
    "Gymnema_sylvestre", "Morinda_citrifolia", "Mucuna_pruriens", "Munronia_pinnata",
    "Opuntia_dillenii", "Piper_sarmentosum", "Plectranthus_amboinicus", "Premna_serratifolia",
    "Scoparia_dulcis", "Sida_cordata", "Stachys_sp", "Tephrosia_purpurea", "Thespesia_populnea",
]

CONFUSABLE_PAIRS = {
    "Sida_cordata": ["Abutilon_indicum"],
    "Abutilon_indicum": ["Sida_cordata"],
}

CONFIDENCE_HIGH = 0.75
CONFIDENCE_LOW = 0.40

model = None
model_load_error = None

try:
    import tensorflow as tf

    model = tf.keras.models.load_model(MODEL_PATH)
except Exception as e:
    model_load_error = str(e)


def run_prediction(pil_image: Image.Image):
    img = pil_image.convert("RGB").resize(IMG_SIZE)
    # No /255 normalization here — the model's first layer already applies
    # efficientnet.preprocess_input to raw 0-255 pixel values (matches training).
    arr = np.asarray(img, dtype=np.float32)
    arr = np.expand_dims(arr, axis=0)

    preds = model.predict(arr, verbose=0)[0]
    top_indices = preds.argsort()[-2:][::-1]
    top1_idx, top2_idx = int(top_indices[0]), int(top_indices[1])
    top1_name, top1_conf = CLASS_NAMES[top1_idx], float(preds[top1_idx])
    top2_name, top2_conf = CLASS_NAMES[top2_idx], float(preds[top2_idx])

    if top1_conf < CONFIDENCE_LOW:
        status = "low"
    elif top1_conf < CONFIDENCE_HIGH:
        status = "moderate"
    else:
        status = "high"

    confusable_with = None
    if top1_name in CONFUSABLE_PAIRS and top2_name in CONFUSABLE_PAIRS[top1_name]:
        confusable_with = top2_name

    return {
        "label": top1_name,
        "confidence": top1_conf,
        "secondLabel": top2_name,
        "secondConfidence": top2_conf,
        "status": status,
        "confusableWith": confusable_with,
    }


@router.post("/predict", summary="Authenticate Medicinal Plant", description="Upload an image of a medicinal plant leaf to authenticate its species and verify if it is genuine.")
async def predict(file: UploadFile = File(...)):
    if model is None:
        return {"error": True, "message": f"Model unavailable: {model_load_error}"}

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        result = run_prediction(image)
        return {"error": False, **result}
    except Exception as e:
        return {"error": True, "message": f"Prediction failed: {str(e)}"}
