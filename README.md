# FitWise

FitWise is a full-stack fitness intelligence platform that pairs an open-source Large Language Model (**Meta Llama 3 8B**) with a Retrieval-Augmented Generation (RAG) pipeline, clinical safety guardrails, and machine learning trajectory clustering.

Instead of providing static template routines or unconstrained generic AI chats, FitWise dynamically pulls user biometrics, medical history, and past session volume from PostgreSQL to generate safe, adaptive workout and nutrition protocols in real time.

---

## Live Deployment

- **Web Application:** [https://fit-wise-seven.vercel.app](https://fit-wise-seven.vercel.app)
- **Model Inference:** Serverless NVIDIA T4 GPU hosted via [Modal](https://modal.com) (CUDA 12.1)
- **Database & Auth:** Supabase (PostgreSQL)

---

## Technical Overview

### 1. Fine-Tuned Llama 3 (8B) on Serverless GPU
- **Model Foundation:** Meta's Llama 3 (8B Instruct), fine-tuned using LoRA on a curated dataset of 300+ procedural clinical fitness consultations.
- **Quantization:** Exported to GGUF format with `Q4_K_M` 4-bit quantization, reducing the memory footprint from ~15 GB to 4.45 GB.
- **Inference Runtime:** Powered by `llama-cpp-python` running inside an NVIDIA CUDA container on Modal.
- **Zero-Idle Cost:** Configured with `min_containers=0` and a 60-second scale-down window to eliminate idle compute expenses while sustaining warm response latencies below 2.8 seconds.

### 2. Live Biometric RAG Pipeline
- When a user interacts with Coach Llama 3, the FastAPI backend retrieves their current biometrics (age, weight, target calories), dietary preferences (e.g., vegan, keto), injury logs, and historical training volume from Supabase.
- This data is injected into a structured context window before inference, ensuring the model's recommendations align with past performance rather than generic assumptions.

### 3. Clinical Safety Guardrail Engine
- Workouts dynamically adjust around user-reported health conditions:
  - **Hypertension:** Disables sub-5RM maximum-effort strain lifts and inverted exercises to prevent intra-thoracic pressure (Valsalva maneuver) spikes.
  - **Patellofemoral & Knee Joint Issues:** Substitutes high-shear knee flexion movements (>90° leg extensions) with posterior chain hip hinges, box squats, and reverse sled drags.
  - **Asthma / Respiratory Constraints:** Eliminates anaerobic redline intervals in favor of steady-state Zone 2 aerobic pacing and extended recovery intervals (120s+).

### 4. KNN Archetype Clustering
- Employs `scikit-learn` K-Nearest Neighbors (KNN) models to classify user biometric trajectories into strategic cohorts (Cut, Bulk, Recomposition).
- Outputs mathematical baseline calorie estimates, macro splits, and target volume targets displayed on the interactive analytics dashboard.

### 5. Frontend & Interactive Showcase
- Built with React 18, TypeScript, Tailwind CSS, shadcn/ui, and Framer Motion.
- Includes an interactive sandbox simulator allowing visitors to test-drive goal and medical guardrail adaptations in real time without creating an account.
- Features multi-week tonnage analytics, session-by-session workout logging, and theme customization (dark/light mode).

---

## System Architecture

```text
[ Client Browser ]
  │
  ├─ React 18 + Vite + TypeScript (Vercel)
  ├─ Framer Motion + Tailwind CSS
  │
  ▼
[ FastAPI Backend ]
  │
  ├─ Asynchronous REST Endpoints (Python 3.11)
  ├─ JWT Session Validation & Pydantic Schemas
  ├─ scikit-learn KNN Archetype Classifier
  │
  ├──► [ Supabase (PostgreSQL) ]
  │      ├─ User Biometrics & Health Flags
  │      ├─ Workout Sets, Reps & Historical Tonnage
  │      └─ Daily Macro & Calorie Logs
  │
  └──► [ Modal Serverless GPU Cluster ]
         ├─ NVIDIA T4 / A10G (CUDA 12.1)
         ├─ llama-cpp-python
         └─ Llama 3 8B (4-bit GGUF Quantized)
              │
              ▼
       [ Clinical Guardrail Validator ]
              │
              ▼
    [ Tailored Streaming Output ]
```

---

## Project Structure

```text
FitWise/
├── backend/
│   ├── alembic/              # Database schema migrations
│   ├── routes/               # API endpoints (auth, metrics, workouts, coach)
│   ├── schemas/              # Pydantic validation schemas
│   ├── ai_coach.py           # Llama 3 inference handler & prompt templates
│   ├── config.py             # Environment configuration
│   ├── db.py                 # SQLAlchemy session engine
│   ├── main.py               # FastAPI application entrypoint
│   ├── models.py             # SQLAlchemy ORM models
│   ├── plans.py              # Workout generation logic
│   └── requirements.txt      # Python backend dependencies
│
├── frontend/
│   ├── public/               # Static assets & brand media
│   ├── src/
│   │   ├── components/       # Reusable UI & navigation components (shadcn/ui)
│   │   ├── hooks/            # React hooks (useAuth, useTheme, useToast)
│   │   ├── lib/              # API clients and utility helpers
│   │   ├── pages/            # View routes (Landing, Dashboard, Coach, Workouts, Analytics)
│   │   ├── App.tsx           # Application route definitions
│   │   └── main.tsx          # Frontend entrypoint
│   ├── package.json          # Node dependencies & build scripts
│   └── vite.config.ts        # Vite configuration
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
To deploy the Llama 3 model to serverless GPUs using Modal:
```bash
pip install modal
modal setup
modal deploy modal_deploy.py
```

---

## Author

**Kaavya Shah**  
Computer Science Engineering Student  
Focus areas: Full-Stack Engineering, Generative AI Systems, RAG Architectures  
GitHub: [@Kaavyashah22](https://github.com/Kaavyashah22)
