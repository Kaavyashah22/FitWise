# 🏋️‍♂️ FitWise — AI Fitness Intelligence System

FitWise is a full-stack, explainable AI fitness intelligence system that generates personalized diet and workout strategies using machine learning, adaptive health metrics, and goal-specific modeling.

It integrates modern frontend engineering with an ML-driven backend to deliver intelligent, transparent, and dynamic fitness recommendations.

---

## 🌐 Live Application

🔗 https://fit-wise-seven.vercel.app  
⚙ Backend API hosted on Render  

---

# 🚀 Key Features

- 📊 BMI, BMR & TDEE calculation engine  
- 🧠 KNN-based goal classification (Cut / Bulk / Maintain)  
- 🥗 Goal-specific diet strategy generation  
- 🏋️ Dynamic workout split recommendation  
- 📈 Strength analytics & 1RM estimation  
- 🧮 Calorie-based macronutrient distribution visualization  
- 🧠 Model confidence scoring  
- 🔍 AI explanation layer (why this plan was selected)  
- 🌙 Dark mode support  
- 🔐 Local profile persistence  
- ☁️ Cloud deployment (Vercel + Render)

---

# 🏗 System Architecture

## 🖥 Frontend
- React + TypeScript  
- Vite  
- Tailwind CSS  
- shadcn/ui  
- Recharts & Chart.js  
- Hosted on Vercel  

## 🧠 Backend
- Python  
- Flask API  
- scikit-learn (KNN model)  
- Joblib (model serialization)  
- Hosted on Render  

---

# 🧠 AI Model Overview

FitWise uses a K-Nearest Neighbors (KNN) classification model to determine the optimal fitness strategy cluster.

### Input Features:
- Age  
- BMI  
- Activity Level  
- Fitness Goal  

### Output:
- Strategy cluster selection  
- Diet plan generation  
- Workout split recommendation  
- Confidence score  
- Explainability reasoning layer  

This ensures transparent, data-driven personalization.

---

# 📊 Intelligence Layer

- Confidence score returned with every recommendation  
- Explanation block describing decision reasoning  
- Calorie-based macro distribution (4-4-9 principle)  
- Estimated 1RM tracking for strength progression  
- Goal validation safety layer (BMI-based warnings)

---

# 🔬 Research & Long-Term Vision

FitWise is designed as a foundation for an advanced AI-driven fitness platform.

## 🎥 Computer Vision & Motion Intelligence (Primary Research Direction)

- Real-time pose estimation using MediaPipe / OpenPose  
- Exercise form detection and correction  
- Joint-angle analysis for squat, deadlift, press validation  
- Automatic rep counting using movement tracking  
- Tempo detection and range-of-motion analysis  
- Injury-risk prediction from movement patterns  

This module aims to transform FitWise into a real-time AI coaching system.

---

## 🤖 Adaptive AI Evolution

- Reinforcement learning layer to adapt plans based on user progress  
- Metabolic adaptation modeling for long-term calorie adjustments  
- Goal progression prediction using trend regression  
- Hybrid ML architecture (clustering + regression + heuristics)

---

## 📈 Advanced Personalization

- Explainable AI visualization (feature importance mapping)  
- Multi-user cloud-scale model inference  
- Wearable API integration (Apple Health / Fitbit)  

---

# 📂 Project Structure

```
FitWise/
├── backend/         # Flask API + ML models
├── frontend/        # React + TypeScript frontend
├── README.md
└── .gitignore
```

---

# 🛠 How to Run Locally

## 1️⃣ Backend

```
cd backend
pip install -r requirements.txt
python3 api.py
```

Backend runs on:  
http://localhost:5000

---

## 2️⃣ Frontend

```
cd frontend
npm install
npm run dev
```

Frontend runs on (default Vite):  
http://localhost:5173

---

# 🌟 Author

Kaavya Shah  
Computer Science Engineering Student  

Designed and implemented as a full-stack, explainable AI fitness intelligence system integrating modern frontend engineering with machine learning-driven backend logic.
