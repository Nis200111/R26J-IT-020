# Bio Heritage AI

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

### 3. Medicinal Plant Disease Detection & Quality Scoring
A computer vision diagnostic tool using a dual-stage architecture (EfficientNetB0 and U-Net). It not only identifies if a leaf is diseased but also calculates the infection spread percentage through pixel segmentation, ultimately providing an automated "Medicinal Quality Grade."

### 4. Medical Plant Climate Forecasting & Suitability Prediction
A predictive ML system leveraging the Prophet time-series model to forecast future temperature and precipitation changes in Sri Lanka up to 2030. It couples this with a rule-based classifier to predict which regional habitats will remain suitable for cultivating specific medicinal plants under changing climates.

## Setup and Deployment
Set `NEXT_PUBLIC_API_URL` in frontend `.env.local` to connect to the backend.
Deploy frontend to Vercel and backend to a Python-supported host.
