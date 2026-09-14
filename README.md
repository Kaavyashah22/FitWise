# FitWise

FitWise is a clinical-grade fitness intelligence system combining classical machine learning (**XGBoost Injury Radar** and **KNN Archetype Classifier**), a fine-tuned Large Language Model (**Meta Llama 3 8B** on serverless GPUs), automated medical safety guardrails, and an offline-first Progressive Web App (PWA) engine.

Instead of providing static template routines or unconstrained generic AI chats, FitWise dynamically pulls user biometrics, medical contraindications, and past session volume from PostgreSQL to generate safe, adaptive workout, recovery, and nutrition protocols in real time.

---

## Live Deployment & Access

- **Web Application & PWA:** [https://fit-wise-seven.vercel.app](https://fit-wise-seven.vercel.app)
- **Model Inference:** Serverless NVIDIA T4/A10G GPU hosted via [Modal](https://modal.com) (CUDA 12.1, <2.8s latency)
- **Database & Auth:** Supabase (PostgreSQL)
- **Mobile QR Onboarding:** Live scannable QR code on landing page for instant iOS & Android standalone installation

---

## Core Machine Learning & AI Systems

### 1. XGBoost Predictive Biomechanics & Injury Radar (92.5% Accuracy)
- **Empirical Validation:** Trained and evaluated across 1,000 athletes spanning 8 distinct athletic disciplines (Athletics, Football, Cricket, Badminton, Basketball, Hockey, Swimming, Tennis).
- **Cross-Disciplinary Invariants:** Overcomes single-sport sample starvation (<15 high-risk cases) by learning fatigue and recovery invariants:
  - **Recovery Strain (21.6% feature importance)**: Quantifies acute fatigue relative to sleep and recovery indices.
  - **Energy Balance (19.0% feature importance)**: Relates caloric intake to metabolic expenditure.
  - **Cumulative Workload Load (16.3% feature importance)**: Acute-to-chronic workload ratios.
- **Clinical Safety Benchmark:** Achieves **100% precision on high-risk injury classifications** and a **90.35% Macro F1-Score**, guaranteeing that overtrained athletes are flagged before tissue rupture or severe strain occurs.

### 2. KNN Biometric Strategy Classifier ($k = 3$)
- **Archetype Routing:** Uses `scikit-learn` K-Nearest Neighbors ($k=3$, Euclidean distance metric) to map 5-dimensional user vectors (`[Age, Height, Weight, Gender, Activity Level]`) into calibrated strategy cohorts (Cut, Bulk, Recomposition).
- **Hyperparameter Design ($k=3$):** An odd integer value eliminates 50/50 voting deadlocks while maintaining sharp decision boundaries tailored to localized body composition archetypes (~20–25 training samples per sub-class) without over-smoothing.
- **Confidence Scoring:** Generates statistical confidence metrics and explainability logs displayed directly within the user dashboard.

### 3. Fine-Tuned Llama 3 (8B) on Serverless GPU
- **Model Foundation:** Meta's Llama 3 (8B Instruct), fine-tuned using LoRA on a curated dataset of procedural clinical fitness consultations.
- **Quantization:** Exported to GGUF format with `Q4_K_M` 4-bit quantization, reducing memory footprint from ~15 GB to 4.45 GB.
- **Inference Runtime:** Powered by `llama-cpp-python` running inside an NVIDIA CUDA container on Modal.
- **Zero-Idle Cost:** Configured with `min_containers=0` and auto-scaling to eliminate idle compute overhead while sustaining warm response latencies below 2.8 seconds.

### 4. Live Biometric RAG Pipeline
- When a user interacts with Coach Llama 3, the FastAPI backend retrieves their current biometrics, dietary preferences (e.g., veg, non-veg, vegan), injury logs, and 7-day volume load from Supabase PostgreSQL.
- Context is dynamically formatted and injected before inference, allowing the assistant to calculate progressive overload and adjust volume with full continuity of past sessions.

### 5. Automated Medical Guardrails & Contraindications
- Deterministic safety filter programmatically alters routines around user-reported conditions:
  - **Hypertension:** Prohibits heavy 1–5RM strain and inverted exercises to prevent acute intra-thoracic pressure spikes (Valsalva maneuver); enforces DASH diet sodium limits.
  - **Patellofemoral & Knee Joint Issues:** Eliminates high-shear open-kinetic knee extensions (>90°), prescribing posterior-chain hip hinges, box squats, and sled drags.
  - **Asthma / Respiratory Constraints:** Eliminates anaerobic redline circuits in favor of steady Zone-2 aerobic pacing and extended recovery intervals (120s+).

### 6. Progressive Web App (PWA) & Offline Gym Engine
- **Zero App Store Friction:** Installable directly from Safari (iOS) and Chrome (Android) to the home screen as a full-screen standalone application.
- **100% Offline Gym Logging:** Optimistic local queuing via `fitwise_offline_workout_queue` allows athletes in zero-signal gym basements to log sets, reps, and weights seamlessly.
- **Automatic Cloud Sync:** Custom `useOnlineStatus` hook detects internet reconnection and flushes queued workouts to Supabase without manual intervention.
- **Hardware Rest Alerts:** Uses device vibration API for physical haptic notification when set rest timers expire.
- **Display Mode Auto-Detection:** Custom `useIsAppInstalled` hook detects iOS `navigator.standalone` and standard `(display-mode: standalone)`, automatically hiding redundant installation prompts.

---

## System Architecture

```text
[ Progressive Web App (PWA) Client ]
  │  ├─ React 18 + Vite + TypeScript (Tailwind CSS + Framer Motion)
  │  ├─ Standalone Display Mode + Hardware Haptics
  │  └─ Optimistic Offline Queue & Local Storage Sync
  │
  ▼
[ FastAPI Gateway (Python 3.11) ]
  │
  ├─ Step 01: JWT Session Validation & Pydantic Schemas
  ├─ Step 02: scikit-learn KNN Archetype Classifier (k=3)
  │
  ├──► [ Supabase (PostgreSQL) ]
  │      ├─ Biometric Trajectories & Health Constraints
  │      ├─ Workout Sets, Reps & Cumulative Tonnage Logs
  │      └─ Daily Nutrition & Consistency Streaks
  │
  ├──► [ XGBoost Injury Radar (GBDT) ]
  │      ├─ 17 Biomechanical & Fatigue Features
  │      ├─ 92.5% Cross-Disciplinary Generalization
  │      └─ Automated Recovery Strain Interception
  │
  └──► [ Modal Serverless GPU Cluster ]
         ├─ NVIDIA T4 / A10G (CUDA 12.1)
         ├─ llama-cpp-python Streaming Runtime
         └─ Fine-Tuned Llama 3 8B (4-bit GGUF Quantized)
              │
              ▼
       [ Clinical Safety Guardrail Interceptor ]
              │
              ▼
     [ Safe, Adaptive Multi-Modal Streaming Output ]
```

---

## Project Structure

```text
FitWise/
├── backend/
│   ├── alembic/              # Database schema migrations
│   ├── routes/               # API endpoints (auth, metrics, workouts, coach, predict)
│   ├── schemas/              # Pydantic request/response schemas
│   ├── services/             # Injury predictor and auxiliary ML services
│   ├── ml/                   # Model training notebooks, academic curves, dataset synthesis
│   ├── ai_coach.py           # Llama 3 inference handler & prompt templates
│   ├── config.py             # Environment configuration
│   ├── db.py                 # SQLAlchemy session engine
│   ├── main.py               # FastAPI application entrypoint
│   ├── models.py             # SQLAlchemy ORM models
│   ├── plans.py              # KNN plan generation and medical adjustment rules
│   ├── model_cut.pkl         # Trained KNN Cut model (k=3)
│   ├── model_bulk.pkl        # Trained KNN Bulk model (k=3)
│   ├── model_maintain.pkl    # Trained KNN Maintain model (k=3)
│   └── requirements.txt      # Python backend dependencies
│
├── frontend/
│   ├── public/               # PWA manifests, icons, and static assets
│   ├── src/
│   │   ├── components/       # UI components (shadcn/ui, InstallAppModal, Navigation)
│   │   ├── hooks/            # Hooks (useAuth, useOnlineStatus, useIsAppInstalled, useTheme)
│   │   ├── lib/              # API clients, offline workout store, health calculations
│   │   ├── pages/            # Views (LandingPage, DashboardPage, WorkoutsPage, CoachPage)
│   │   ├── App.tsx           # Route layout and safe-area wrappers
│   │   └── main.tsx          # Frontend mount & service worker registration
│   ├── package.json          # Node dependencies & build scripts
│   └── vite.config.ts        # Vite build configuration
│
├── ml_training/
│   ├── fitwise_dataset.jsonl # 300+ procedural clinical consultation dataset
│   ├── add_data.py           # Dataset synthesis pipeline
│   └── fitwise_lora_model/   # LoRA fine-tuning adapter weights
│
├── modal_deploy.py           # Modal serverless GPU deployment definition
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- A Supabase PostgreSQL instance (or local PostgreSQL)

### 1. Clone the Repository
```bash
git clone https://github.com/Kaavyashah22/FitWise.git
cd FitWise
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=postgresql://user:password@host:port/dbname
SECRET_KEY=your_jwt_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key  # Optional fallback
```

Run database migrations:
```bash
alembic upgrade head
```

Start the FastAPI development server:
```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the Vite development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### 4. GPU Inference Deployment (Optional)
To deploy the fine-tuned Llama 3 model to serverless GPUs using Modal:
```bash
pip install modal
modal setup
modal deploy modal_deploy.py
```

---

## Authorship & Academic Mentorship

- **Lead Developer**: **Kaavya Shah** — Full-Stack & Generative AI Engineer ([@Kaavyashah22](https://github.com/Kaavyashah22))
- **Faculty Mentor**: **Dr. Amandeep Cheema**
- **Project**: FitWise — Academic Capstone & Fitness Intelligence Research System
