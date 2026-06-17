# 🏋️‍♂️ FitWise - AI Fitness Intelligence System

FitWise is a full-stack, AI-powered fitness intelligence system. It utilizes a hybrid AI architecture combining traditional machine learning (KNN) for structural clustering with advanced **Generative AI (Llama 3)** for hyper-personalized, dynamic fitness coaching.

By leveraging **Retrieval-Augmented Generation (RAG)** and **Serverless GPU hosting**, FitWise delivers elite, real-time fitness strategies based on a user's live biometric data, medical history, and workout logs.

---

## 🌐 Live Application

🔗 https://fit-wise-seven.vercel.app  
⚙ Serverless AI Inference hosted on **Modal (NVIDIA GPUs)**

---

# 🚀 Key Features

- 🧠 **Fine-Tuned LLM Coach:** Meta's **Llama 3** (8B), explicitly fine-tuned on a synthetic dataset of 300 curated fitness consultations to enforce strict medical guardrails and a specialized coaching persona.
- ⚡ **Serverless GPU Inference:** Model deployed to **Modal** via `llama-cpp-python`, utilizing **4-bit Quantization (GGUF)** to slash memory from 15GB to 4.5GB and drop latency to under 3 seconds.
- 🔄 **Live RAG Pipeline:** A custom Retrieval-Augmented Generation pipeline dynamically queries PostgreSQL to inject a user's real-time medical history, diet preferences, and past workouts directly into the AI's context window.
- 📊 **KNN-Based Goal Classification:** A fast `scikit-learn` K-Nearest Neighbors model is still utilized to classify strategic clusters (Cut, Bulk, Maintain) and power interactive dashboards.
- 🧬 **Medical Safety Layer:** The AI dynamically alters recommendations based on specific user conditions (e.g., Asthma, Diabetes, Joint Issues).
- 🔐 **Secure Authentication:** JWT-based security flow coupled with seamless **Supabase Auth**.
- 🌙 **Immersive UX:** An edge-to-edge full-screen chat interface built with **React**, **Tailwind CSS**, and **Framer Motion** for a native feel.

---

# 🏗 System Architecture

## 🖥 Frontend
- **React + TypeScript** (Vite)
- **Tailwind CSS + shadcn/ui**
- **Framer Motion** (Fluid micro-animations)
- Hosted securely on **Vercel**

## 🧠 Backend & AI Inference
- **Python + FastAPI** (Asynchronous backend)
- **Supabase (PostgreSQL)** (Live RAG data source)
- **Modal Serverless GPUs** (Scales to zero to eliminate idle costs)
- **Llama.cpp & HuggingFace** (Optimized 4-bit GGUF inference)
- **scikit-learn** (Legacy KNN models)

---

# 🧠 AI Architecture Deep-Dive

FitWise utilizes a **Hybrid AI Pipeline**:

### 1. The RAG Pipeline (Retrieval-Augmented Generation)
When a user asks a question, the FastAPI backend queries Supabase to extract their specific age, weight, goals, dietary restrictions (e.g., Vegan), and medical conditions. This data is securely packed into a hidden prompt and fed to the LLM, ensuring responses are mathematically and biologically tailored to the specific user.

### 2. Fine-Tuning with Synthetic Data
A custom Python script was used to procedurally generate 300 highly complex, medically constrained fitness consultations. The Llama 3 model was fine-tuned on this dataset to guarantee it strictly adheres to safety protocols (e.g., "Do not recommend the Valsalva maneuver to users with Hypertension").

### 3. Edge Optimization
Running an 8-Billion parameter model requires significant hardware. By compiling the model to the **GGUF format** and applying **Q4_K_M 4-bit Quantization**, the VRAM requirement was reduced by 70%, allowing it to run lightning-fast on a single NVIDIA T4 GPU.

---

# 📂 Project Structure

```text
FitWise/
├── backend/         # FastAPI, RAG Pipeline, Modal Serverless deploy scripts
├── frontend/        # React + TypeScript UI, Framer Motion layouts
├── ml_training/     # Synthetic Data Generation, LoRA weights, JSONL datasets
├── README.md
└── .gitignore
```

---

# 🌟 Author

**Kaavya Shah**  
*Computer Science Engineering Student*  
*Specializing in Full-Stack Engineering, Generative AI, and RAG architectures.*
