# Deliverly — Food Delivery Time Predictor (React frontend)

A responsive React + Vite frontend for a Python/FastAPI machine-learning API.

## Requirements
- Node.js 18+ (prefer a current LTS release)
- Your Python FastAPI backend running locally

## Run the frontend
From this folder:

```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually http://localhost:5173).

## Backend connection
By default, the frontend sends predictions to `http://127.0.0.1:8000/predict`.

To use another API URL, create `.env` in this folder:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Restart Vite after changing `.env`.

The backend should accept a POST `/predict` JSON body with these fields:

```json
{
  "distance_km": 5,
  "preparation_time_min": 15,
  "traffic_level": 2,
  "weather_severity": 0,
  "rider_experience_years": 3
}
```

It should return:

```json
{ "predicted_minutes": 32.5 }
```

The FastAPI CORS configuration must allow the frontend origin (usually `http://localhost:5173`). Make sure the saved model's expected feature names and order match the backend's input DataFrame. Keep `delivery_model.pkl` on the Python backend; it does not belong in the React public folder.

## Build for deployment

```bash
npm run build
npm run preview
```

The generated static site is placed in `dist/`.
