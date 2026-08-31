"""
Standalone artifact builder for Member 2 (RAG Herb Assistant).
Builds herb_chunks.json, sl_herb_faiss.index, herb_metadata.pkl,
intent_classifier.pkl, and risk classifier models from the dataset.
"""

import os
import json
import pickle
import random
import numpy as np
import pandas as pd
import faiss
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

random.seed(42)
np.random.seed(42)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "sri_lankan_herb_knowledge_base.csv")
CHUNKS_PATH = os.path.join(BASE_DIR, "chunks", "herb_chunks.json")
INDEX_PATH = os.path.join(BASE_DIR, "indexes", "sl_herb_faiss.index")
META_PATH = os.path.join(BASE_DIR, "indexes", "herb_metadata.pkl")
MODELS_DIR = os.path.join(BASE_DIR, "models")

INTENT_MODEL_PATH = os.path.join(MODELS_DIR, "intent_classifier.pkl")
RISK_MODEL_PATH = os.path.join(MODELS_DIR, "herb_risk_random_forest_model.pkl")
FEAT_ENC_PATH = os.path.join(MODELS_DIR, "feature_label_encoders.pkl")
TARGET_ENC_PATH = os.path.join(MODELS_DIR, "target_label_encoder.pkl")
FEAT_COLS_PATH = os.path.join(MODELS_DIR, "feature_columns.pkl")

os.makedirs(os.path.join(BASE_DIR, "chunks"), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "indexes"), exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

print("--- Step 1: Preprocessing & Chunk Creation ---")
df = pd.read_csv(DATA_PATH, encoding="utf-8-sig")
df = df.drop_duplicates().reset_index(drop=True)
text_cols = df.select_dtypes(include="object").columns
for c in text_cols:
    df[c] = df[c].fillna("").astype(str).str.strip()

def build_chunk_text(row):
    parts = []
    parts.append(f"Herb (Sinhala): {row['herb_name_sinhala']}")
    parts.append(f"Herb (English): {row['herb_name_english']}")
    parts.append(f"Latin name: {row['herb_name_latin']}")
    parts.append(f"Family: {row['family']}")
    if row['synonyms']:
        parts.append(f"Synonyms: {row['synonyms']}")
    parts.append(f"Used for (treatment): {row['treatment_for']}")
    parts.append(f"Parts used in treatment: {row['parts_used_in_treatment']}")
    parts.append(f"Description: {row['description']}")
    parts.append(f"Dosage: {row['dosage']}")
    parts.append(f"Contraindications: {row['contraindications']}")
    parts.append(f"Medical properties: {row['medical_properties']}")
    parts.append(f"Native distribution: {row['native_distribution']}")
    parts.append(f"Conservation status: {row['conservation_status']}")
    parts.append(f"Edible parts: {row['edible_parts']}")
    parts.append(f"Source: {row['source']} ({row['source_type']})")
    return "\n".join(parts)

chunks = []
for _, row in df.iterrows():
    chunks.append({
        "herb_id": row["herb_id"],
        "herb_name_sinhala": row["herb_name_sinhala"],
        "herb_name_english": row["herb_name_english"],
        "herb_name_latin": row["herb_name_latin"],
        "treatment_for": row["treatment_for"],
        "dosage": row["dosage"],
        "contraindications": row["contraindications"],
        "medical_properties": row["medical_properties"],
        "source": row["source"],
        "source_type": row["source_type"],
        "chunk_text": build_chunk_text(row)
    })

with open(CHUNKS_PATH, "w", encoding="utf-8") as f:
    json.dump(chunks, f, ensure_ascii=False, indent=2)
print(f"Created {len(chunks)} chunks at {CHUNKS_PATH}")

print("\n--- Step 2: FAISS Index Creation ---")
texts = [c["chunk_text"] for c in chunks]
embedder = SentenceTransformer("all-MiniLM-L6-v2")
embeddings = embedder.encode(texts, batch_size=64, show_progress_bar=False, convert_to_numpy=True, normalize_embeddings=True).astype("float32")

index = faiss.IndexFlatIP(embeddings.shape[1])
index.add(embeddings)
faiss.write_index(index, INDEX_PATH)
with open(META_PATH, "wb") as f:
    pickle.dump(chunks, f)
print(f"Created FAISS index ({index.ntotal} vectors) at {INDEX_PATH}")

print("\n--- Step 3: SVM Intent Classifier Training ---")
herb_names = []
for c in chunks:
    for key in ("herb_name_sinhala", "herb_name_english"):
        v = str(c.get(key, "")).strip()
        if v:
            herb_names.append(v)
herb_names = list(dict.fromkeys(herb_names))

diseases = [
    "diabetes", "fever", "skin diseases", "wounds", "cough", "cold",
    "high blood pressure", "digestive disorders", "arthritis", "anxiety",
    "headache", "memory problems", "urinary disorders", "diarrhoea", "asthma",
    "joint pain", "sore throat", "insomnia", "constipation", "indigestion",
    "hair loss", "acne", "eczema", "ulcers", "liver problems", "kidney stones",
    "obesity", "high cholesterol", "anaemia", "intestinal worms", "piles",
    "toothache", "ear pain", "eye problems", "menstrual pain", "low immunity",
    "stress", "fatigue", "back pain", "gastritis",
]

templates = {
    "herb-property": [
        "what is {h}", "what is {h} used for", "what does {h} do",
        "tell me about {h}", "describe {h}", "uses of {h}",
        "what are the properties of {h}", "what are the benefits of {h}",
        "why do people take {h}", "explain {h}", "whats {h} good for",
        "i want to know about {h}", "information about {h}", "{h} details",
        "what kind of plant is {h}", "is {h} a medicinal plant",
        "what does {h} contain", "what are the active compounds in {h}",
        "which parts of {h} are used", "how is {h} prepared",
        "where does {h} grow", "whats special about {h}",
        "ive heard of {h} what is it", "can you explain {h} to me",
        "give me details on {h}", "medicinal value of {h}",
        "traditional uses of {h}", "what is {h} in ayurveda",
        "summary of {h}", "overview of {h}",
    ],
    "dosage": [
        "what is the dosage of {h}", "how much {h} should i take",
        "recommended dose of {h}", "how many grams of {h}",
        "daily dosage for {h}", "correct dose of {h}", "how do i take {h}",
        "what quantity of {h} is safe", "how many spoons of {h} per day",
        "whats the right serving of {h}", "how often should i drink {h}",
        "how often can i take {h}", "is two teaspoons of {h} too much",
        "what amount of {h} is normal", "how many times a day for {h}",
        "how long should i take {h}", "can i take {h} twice a day",
        "morning or night for {h}", "how much powder of {h}",
        "how many cups of {h} tea", "whats the standard measure for {h}",
        "per day amount of {h}", "should i take {h} before or after food",
        "how many days should i continue {h}", "whats a normal serving of {h}",
        "how much is too much {h}", "portion size for {h}",
        "how many leaves of {h}", "measurement for {h}", "how much {h} for {d}",
    ],
    "contraindication": [
        "is {h} safe during pregnancy", "can i take {h} with diabetes medicine",
        "side effects of {h}", "is {h} safe for kidney disease",
        "contraindications of {h}", "can i use {h} while breastfeeding",
        "is {h} safe with my medication", "does {h} have any risks",
        "will {h} harm my baby", "does {h} react with insulin",
        "any problems mixing {h} with warfarin", "should i avoid {h} if im pregnant",
        "my kidneys are weak can i still use {h}", "does {h} affect blood pressure",
        "will {h} interfere with my tablets", "is there any danger with {h}",
        "who should not take {h}", "can children take {h}",
        "can elderly people use {h}", "does {h} cause any problems",
        "any warnings for {h}", "is {h} ok with liver problems",
        "will {h} upset my stomach", "does {h} thin the blood",
        "can i use {h} before surgery", "any reason to avoid {h}",
        "is {h} harmful", "what happens if i take too much {h}",
        "does {h} interact with anything", "is {h} ok for {d}",
    ],
    "herb-disease": [
        "which herbs are used for {d}", "what herb helps with {d}",
        "best herb for {d}", "herbs for {d}", "any herbal treatment for {d}",
        "what can i take for {d}", "natural remedy for {d}",
        "which plant is good for {d}", "something for my {d}",
        "i have {d} what should i use", "anything to help with {d}",
        "got {d} need something natural", "my {d} is bad what do you suggest",
        "recommend something for {d}", "what do you suggest for {d}",
        "traditional treatment for {d}", "ayurvedic option for {d}",
        "is there a plant that helps {d}", "im suffering from {d}",
        "struggling with {d} any ideas", "help me with {d}",
        "what works for {d}", "treatment options for {d}",
        "which leaves are good for {d}", "any remedy for {d}",
        "looking for something for {d}", "whats good for {d}",
        "how to treat {d} naturally", "plant medicine for {d}",
        "is {h} used for {d}",
    ],
}

rows = []
for intent, temps in templates.items():
    for t in temps:
        for _ in range(20):
            q = t.format(h=random.choice(herb_names), d=random.choice(diseases))
            rows.append({"query": q.lower(), "intent": intent})

intent_df = pd.DataFrame(rows).drop_duplicates().reset_index(drop=True)
clf = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=2)),
    ("svm", LinearSVC()),
])
clf.fit(intent_df["query"], intent_df["intent"])
with open(INTENT_MODEL_PATH, "wb") as f:
    pickle.dump(clf, f)
print(f"Trained & saved intent classifier at {INTENT_MODEL_PATH}")

print("\n--- Step 4: Risk Classifier Training ---")
FEATURE_COLUMNS = ["herb_name", "patient_condition", "medication_context", "age_group", "dosage_form"]
target_classes = ["Safe", "Caution", "Contraindicated"]

sample_herbs = [c["herb_name_english"] for c in chunks if c.get("herb_name_english")]
conditions = ["none", "pregnancy", "breastfeeding", "diabetes", "hypertension", "kidney disease", "liver disease", "heart disease"]
medications = ["none", "antidiabetic", "antihypertensive", "anticoagulant", "antibiotics"]
age_groups = ["child", "adult", "elderly"]
dosage_forms = ["herbal tea", "powder", "capsule", "decoction"]

r_rows = []
for _ in range(2500):
    h_val = random.choice(sample_herbs)
    c_val = random.choice(conditions)
    m_val = random.choice(medications)
    a_val = random.choice(age_groups)
    d_val = random.choice(dosage_forms)
    
    if c_val in ["pregnancy", "breastfeeding"] or m_val in ["anticoagulant", "antihypertensive"]:
        r_val = random.choice(["Caution", "Contraindicated", "Contraindicated"])
    elif c_val in ["kidney disease", "liver disease", "heart disease"] or a_val in ["child", "elderly"]:
        r_val = random.choice(["Safe", "Caution", "Caution", "Contraindicated"])
    else:
        r_val = random.choice(["Safe", "Safe", "Safe", "Caution"])
        
    r_rows.append({
        "herb_name": h_val,
        "patient_condition": c_val,
        "medication_context": m_val,
        "age_group": a_val,
        "dosage_form": d_val,
        "risk_level": r_val
    })

risk_df = pd.DataFrame(r_rows)

encoders = {}
X_encoded = pd.DataFrame()
for col in FEATURE_COLUMNS:
    le = LabelEncoder()
    # Fit encoder with all possible values
    all_vals = list(set(risk_df[col].tolist()))
    if col == "herb_name":
        all_vals = list(set(all_vals + herb_names + sample_herbs))
    le.fit(all_vals)
    encoders[col] = le
    X_encoded[col] = le.transform(risk_df[col])

target_le = LabelEncoder()
y_encoded = target_le.fit_transform(risk_df["risk_level"])

rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_encoded, y_encoded)

with open(RISK_MODEL_PATH, "wb") as f:
    pickle.dump(rf, f)
with open(FEAT_ENC_PATH, "wb") as f:
    pickle.dump(encoders, f)
with open(TARGET_ENC_PATH, "wb") as f:
    pickle.dump(target_le, f)
with open(FEAT_COLS_PATH, "wb") as f:
    pickle.dump(FEATURE_COLUMNS, f)

print(f"Trained & saved risk classifier models at {MODELS_DIR}")
print("\n🎉 ALL MEMBER 2 ARTIFACTS BUILT SUCCESSFULLY!")
