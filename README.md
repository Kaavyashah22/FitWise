🏋️‍♂️ FitWise – AI Powered Fitness Planner

FitWise is a full-stack AI fitness web application that generates personalized diet and workout plans based on a user’s age, BMI, activity level, and fitness goals.

It combines machine learning with a modern TypeScript frontend to deliver intelligent, explainable, and dynamic fitness recommendations.

⸻

🌍 Live Application  
🔗 https://fit-wise-seven.vercel.app

⚙️ Backend API (Hosted on Render)

⸻

🚀 Features
• 🔢 BMI, BMR & TDEE calculation
• 📊 User progress tracking dashboard
• 🏋️ Workout history logging
• 📈 Graph-based analytics
• 🧠 KNN-based AI plan classification
• 🥗 Goal-specific diet strategy (Cut / Bulk / Maintain)
• 💪 Dynamic workout split generator
• 📊 Model confidence scoring
• 📈 AI explanation layer (why this plan was generated)
• 🌙 Dark mode support
• 🔐 Authentication system
• ☁️ Cloud deployment (Render + Vercel)

⸻

🏗️ Tech Stack

Frontend
• React + TypeScript
• Vite
• Tailwind CSS
• shadcn/ui components
• Hosted on Vercel

Backend
• Python
• Flask
• scikit-learn (KNN model)
• Joblib (model serialization)
• Hosted on Render

⸻

📂 Project Structure

FitWise/
│
├── backend/ # Flask API + ML models
├── frontend/ # React + TypeScript frontend
├── .gitignore
└── README.md

⸻

⚙️ How to Run Locally

1️⃣ Backend

cd backend
pip install -r requirements.txt
python3 api.py

Backend runs on:
http://localhost:5001

⸻

2️⃣ Frontend

cd frontend
npm install
npm run dev

Frontend runs on (default Vite):
http://localhost:5173

⸻

🧠 AI Model Overview

FitWise uses a K-Nearest Neighbors (KNN) classification model to determine the optimal fitness strategy cluster.

The model evaluates:
• Age
• BMI
• Activity Level
• Goal (Cut / Bulk / Maintain)

Based on the classification result:
• A strategy cluster is selected
• Diet and workout recommendations are dynamically generated
• Confidence score is returned
• Explainability layer describes why the plan was selected

This ensures transparency and data-driven personalization.

⸻

🔬 Research & Future Development
• 🎥 Pose-estimation module using WebCam for exercise form detection
• 🔐 JWT-based secure authentication
• 🗄️ Database integration (PostgreSQL / MongoDB)
• ⚡ Model optimization for larger datasets
• ☁️ Advanced scalable cloud infrastructure

⸻

👨‍💻 Author

Kaavya Shah
Computer Science Engineering Student

Built as a full-stack AI fitness intelligence system.
