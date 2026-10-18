# Bio Heritage AI
# https://r26-j-it-020.vercel.app/
Multi-Modal Framework for Preserving Sri Lankan Indigenous Medical Knowledge.


## Project Structure
- frontend/: Next.js application for the user interface.
- backend/: FastAPI application for handling models and requests.

## How to run locally

### Backend
Navigate to the backend folder and run the server:
cd backend
pip install -r requirements.txt
uvicorn main:app --reload -port 8000

### Frontend
Navigate to the frontend folder and start the web app:
cd frontend
npm install
npm run dev

## Research Components

Our project integrates four advanced AI and Data Science systems to preserve, identify, and cultivate Sri Lankan indigenous medical knowledge:

### 1. Medicinal Plant Authentication System
A Deep Learning-based visual identification pipeline that authenticates the genuineness of medicinal plants. It prevents the practice of adulteration by distinguishing true medicinal plants from morphologically similar, ineffective, or toxic substitute plants.

### 2. Health-Context-Aware RAG Herb Knowledge Assistant
An intelligent Retrieval-Augmented Generation (RAG) assistant that answers queries about Sri Lankan medicinal herbs. It features an advanced Health-Context-Aware module that requests patient-specific conditions (e.g., pregnancy, medication usage) before generating safe, source-grounded Ayurvedic knowledge and contraindication risks.

### 3. Medicinal Leaf Health Detection & Quality Verification Scoring System
A deep transfer learning diagnostic tool using a fine-tuned EfficientNetB4 convolutional neural network. It classifies leaf health across 5 diagnostic states (Healthy, Anthracnose, Bacterial Leaf Spot, Rot, Rust), computes confidence-weighted class distributions, assigns an automated Ayurvedic Medicinal Suitability (AMS) Quality Grade (Grades A-D), and delivers organic/chemical agricultural remediation guidelines with mandatory harvest withholding period safety warnings. See [MEMBER3_README.md](file:///c:/Users/User/Documents/GitHub/R26J-IT-020/MEMBER3_README.md) for full details.

### 4. Medical Plant Climate Forecasting & Suitability Prediction
A predictive ML system leveraging the Prophet time-series model to forecast future temperature and precipitation changes in Sri Lanka up to 2030. It couples this with a rule-based classifier to predict which regional habitats will remain suitable for cultivating specific medicinal plants under changing climates.

## Setup and Deployment
Set `NEXT_PUBLIC_API_URL` in frontend `.env.local` to connect to the backend.
Deploy frontend to Vercel and backend to a Python-supported host.
