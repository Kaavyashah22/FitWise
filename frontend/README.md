# FitWise Frontend

This is the frontend application for **FitWise – AI Powered Fitness Planner**.

It is built using React and TypeScript and communicates with a Flask backend API
to generate personalized fitness plans based on AI classification.

---

## 🚀 Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Framer Motion

---

## ⚙️ Running Locally

1. Install dependencies

npm install

2. Start development server

npm run dev

The frontend runs on:

http://localhost:8080

---

## 🔗 Backend Requirement

Make sure the Flask backend is running at:

http://localhost:5001

The frontend sends POST requests to:

/predict

---

## 📌 Description

The frontend:

- Collects user data (age, height, weight, activity, goal)
- Calculates BMI, BMR, and TDEE
- Sends input to the AI backend
- Displays:
  - Personalized diet strategy
  - Workout split
  - AI explanation
  - Model confidence score

---

## 👨‍💻 Project Context

Part of the full-stack FitWise AI project combining
machine learning and modern web technologies.