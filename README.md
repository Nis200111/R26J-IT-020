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

## Features
- Plant Authentication System
- Plant Disease Detection System

## Setup and Deployment
Set `NEXT_PUBLIC_API_URL` in frontend `.env.local` to connect to the backend.
Deploy frontend to Vercel and backend to a Python-supported host.
