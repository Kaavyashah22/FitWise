# 🏋️‍♂️ FitWise - ML-Powered Fitness Intelligence System

FitWise is a full-stack, ML-powered fitness intelligence system with explainable clustering and rule-based personalization. It generates personalized diet and workout strategies using machine learning, adaptive health metrics, and goal-specific modeling.

It integrates modern frontend engineering with a high-performance backend to deliver intelligent, transparent, and dynamic fitness recommendations.

---

## 🌐 Live Application

🔗 https://fit-wise-seven.vercel.app  
⚙ Backend API hosted on Render  

---

# 🚀 Key Features

- 📊 **BMI, BMR & TDEE Engine:** Adaptive calculation module for core physiological metrics.
- 🧠 **KNN-Based Goal Classification:** Actionable strategic clustering (Cut / Bulk / Maintain).
- 🧬 **Medical Safety Layer *(New!)*:** Rule-based medical safety layer that adjusts workout and diet plans based on user conditions (e.g., Asthma, Diabetes, Joint Issues).
- 🥗 **Goal-Specific Diet Planning:** Calorie-based macronutrient distribution visualization (4-4-9 principle).
- 🏋️ **Dynamic Workout Split Recommendation:** Intelligent strength analytics & 1RM estimation.
- 🔐 **Secure Authentication *(New!)*:** JWT-based security flow coupled with seamless **Google OAuth** integration.
- 🔍 **Explainable AI Pipeline:** Model confidence scoring and reasoning explanations—so users understand *why* a plan was selected.
- 🌙 **Modern UX:** Highly responsive, beautifully crafted interface using Tailwind CSS and shadcn/ui, featuring dark mode and localized persistence.

---

# 🏗 System Architecture

## 🖥 Frontend
- **React + TypeScript**
- **Vite**
- **Tailwind CSS + shadcn/ui**
- **Recharts & Chart.js**
- Hosted securely on **Vercel**

## 🧠 Backend
- **Python + FastAPI** *(Migrated from Flask for high performance and typing safety)*
- **SQLAlchemy + Alembic** *(Robust Database Management)*
- **scikit-learn** *(KNN model implementation)*
- **Joblib** *(Model serialization)*
- Hosted on **Render**

---

# 🧠 AI Model Overview

FitWise utilizes a lightweight K-Nearest Neighbors (KNN) model for initial fitness strategy classification to identify the optimal fitness path for a user's unique physiological profile.

### Input Features:
- Age  
- BMI  
- Gender
- Activity Level  
- Fitness Goal  
- Medical Constraints 

### Output:
- Strategy cluster selection  
- Tailored diet plan structure  
- Periodized workout split recommendation  
- Confidence score  
- Explainability reasoning layer  

*This design ensures transparent, empirical, and highly personalized coaching.*

---

### 🧩 Plan Generation Pipeline

FitWise combines multiple layers to generate personalized plans:

1. **ML Classification (KNN):** Assigns user to a fitness strategy cluster.
2. **Plan Engine:** Maps cluster to structured workout and diet templates.
3. **Medical Rule Engine:** Applies safety constraints based on user medical history.
4. **Dynamic Personalization:** Adjusts intensity and recommendations based on activity level and metrics.

This hybrid approach ensures both accuracy and safety.

---

# ⚠️ Limitations

- **Medical Adjustments:** Current system uses rule-based medical adjustments (not clinical-grade).
- **ML Complexity:** ML model is based on structured features (not deep learning).
- **Generative Capability:** Plans are static templates with dynamic modifications (not fully generative).

*Future versions aim to address these using LLMs and adaptive learning.*

---

# 🔬 Research & Long-Term Vision

FitWise is being developed as the foundational platform for a hyper-personalized, multimodal AI fitness companion. 

## 🎥 Computer Vision & Motion Intelligence (Next Frontier)
*Transforming FitWise into a real-time responsive digital coach.*
- **Real-Time Pose Estimation:** Using OpenPose/MediaPipe via mobile camera for live exercise form detection.
- **Biomechanical Validation:** Joint-angle analysis for complex compound movements (Squats, Deadlifts, Overhead Press).
- **Injury-Risk Prognostics:** Predictive models analyzing movement patterns and repetition tempos.

## 🤖 Adaptive AI Evolution
*From static generation to dynamic journey management.*
- **Reinforcement Learning Layer:** Continuous plan adaptation based on week-over-week user progress tracking.
- **Metabolic Adaptation Modeling:** Recognizing physical plateaus and triggering dynamic, micro-adjusted calorie constraints and macros.
- **Hybrid Architecture:** Combining Clustering (initial assignment), Regression (progress prediction), and LLM Heuristics (dietary modifications).

## 📈 Holistic Medical & Wearable Integration
*Meeting the user exactly where they are.*
- **Wearable API Aggregation:** Bringing resting heart rates, recovery metrics, and sleep scores from Apple Health, Garmin, and Fitbit directly into the ML pipeline.
- **Deep Feature Importance Mapping:** Allowing users to visually see what lifestyle factors (e.g., sleep vs. diet) are driving or stalling their progress.

---

# 📂 Project Structure

```text
FitWise/
├── backend/         # FastAPI API, ML models, Alembic migrations
├── frontend/        # React + TypeScript UI
├── README.md
└── .gitignore
```

---

# 🛠 How to Run Locally

## 1️⃣ Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run the FastAPI server natively via uvicorn
uvicorn main:app --reload
```
> The API will be available at: `http://localhost:8000`

## 2️⃣ Frontend

```bash
cd frontend
npm install
npm run dev
```
> The frontend will be available at: `http://localhost:5173`

---

# 🌟 Author

**Kaavya Shah**  
*Computer Science Engineering Student*  

*Designed and implemented as a full-stack, ML-powered fitness intelligence system blending modern frontend engineering, robust backend architecture, and transparent hybrid ML logic.*
