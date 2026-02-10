# 🏋️‍♂️ FitWise – AI Powered Fitness Planner

FitWise is a full-stack AI fitness web application that generates personalized diet and workout plans based on a user’s age, BMI, activity level, and fitness goals.

It combines machine learning with a modern TypeScript frontend to deliver intelligent and dynamic fitness recommendations.

---

## 🚀 Features

- 🔢 BMI, BMR & TDEE calculation  
- 🧠 KNN-based AI plan classification  
- 🥗 Goal-specific diet strategy (Cut / Bulk / Maintain)  
- 💪 Dynamic workout split generator  
- 📊 Model confidence scoring  
- 🌙 Dark mode support  
- 🔐 Authentication system  
- 📈 AI explanation layer (why this plan was generated)

---

## 🏗️ Tech Stack

### Frontend
- React + TypeScript  
- Vite  
- Tailwind CSS  
- shadcn/ui components  

### Backend
- Python  
- Flask  
- scikit-learn (KNN model)  
- Joblib (model serialization)

---

## 📂 Project Structure

FitWise/
│
├── backend/          # Flask API + ML models  
├── frontend/         # React + TypeScript frontend  
├── .gitignore  
└── README.md  

---

## ⚙️ How to Run Locally

### 1️⃣ Backend

cd backend  
pip install -r requirements.txt  
python3 api.py  

Backend runs on:  
http://localhost:5001  

---

### 2️⃣ Frontend

cd frontend  
npm install  
npm run dev  

Frontend runs on (default Vite):  
http://localhost:5173  

---

## 🧠 AI Model Overview

- Uses **K-Nearest Neighbors (KNN)** classification  
- Predicts best strategy cluster based on:
  - Age  
  - BMI  
  - Activity Level  
  - Goal  
- Generates adaptive diet + workout strategy  
- Returns model confidence score with explanation  

---

## 📌 Future Improvements

- User progress tracking  
- Workout history dashboard  
- Graph-based analytics  
- Deployment (Render / Vercel)  
- JWT authentication  
- Database integration  

---

## 👨‍💻 Author

**Kaavya Shah**  
Computer Science Engineering Student  
Built as a full-stack AI fitness project.