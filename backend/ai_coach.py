import os
import json
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from huggingface_hub import hf_hub_download
from dotenv import load_dotenv

load_dotenv()

MOCK_AI = False
app = FastAPI(title="FitWise Local AI Inference Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
HF_TOKEN = os.environ.get("HF_TOKEN")

if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    supabase = None
    print("⚠️ Warning: SUPABASE_URL and/or SUPABASE_KEY not found in environment.")

if not MOCK_AI:
    from llama_cpp import Llama
    
    try:
        print(f"⏳ Downloading/Loading highly optimized 4-bit GGUF model into Unified Memory from Hugging Face...")
        dynamic_model_path = hf_hub_download(
            repo_id="kaavyashah/fitwise-llama3-finetuned",
            filename="Meta-Llama-3-8B-Instruct-Q4_K_M.gguf",
            token=HF_TOKEN
        )
        llm = Llama(
            model_path=dynamic_model_path,
            n_gpu_layers=-1, 
            n_ctx=4096,      
            verbose=False    
        )
        print(f"🚀 Success: Llama.cpp engine loaded seamlessly with 4096 token context window!")
    except Exception as e:
        import traceback
        print(f"❌ Failed to load GGUF model.")
        traceback.print_exc()

class GenerateRequest(BaseModel):
    user_id: str
    session_id: str
    prompt: str

@app.post("/api/v1/coach/generate")
async def generate_response(req: GenerateRequest):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")

    try:
        # 1. Fetch full profile and workout history
        user_response = supabase.table("user_profiles").select("*").eq("user_id", req.user_id).execute()
        user_data = user_response.data[0] if user_response.data else {}
        
        workout_response = supabase.table("workouts").select("*").eq("user_id", req.user_id).order("created_at", desc=True).limit(3).execute()
        workout_data = workout_response.data if workout_response.data else []
        
        # Fetch the top 3 most recent chat messages for conversational memory
        chat_response = supabase.table("chat_messages").select("*").eq("user_id", req.user_id).eq("session_id", req.session_id).order("created_at", desc=True).limit(4).execute()
        # Reverse the list so the AI reads them in chronological order
        chat_history_data = chat_response.data[::-1] if chat_response.data else []
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database aggregation error: {str(e)}")

    if not user_data:
        raise HTTPException(status_code=404, detail="User profile records not found")

    # Clean formatting
    food_pref = str(user_data.get("Food_Preference", user_data.get("food_preference", "None"))).strip().upper()
    med_history = str(user_data.get("medical_history", user_data.get("medical_problems", "None Specified"))).strip()
    goal = user_data.get("goal", "Maintain")
    age = user_data.get("age", "Unknown")
    weight = user_data.get("weight_kg", "Unknown")
    gender = user_data.get("gender", "Unknown")

    # DYNAMIC GUARDRAILS (PROFILE OVERRIDES HISTORY)
    if food_pref == "VEGAN":
        diet_guardrail = "DIET SCOPE (Applies ONLY when user explicitly asks about food, meals, recipes, or nutrition): The user is strictly VEGAN. ONLY suggest 100% plant-based foods. NEVER mention dietary preferences or say 'vegan-friendly' when discussing gym exercises, stretching, or workouts!"
    elif food_pref in ["VEGETARIAN", "VEG"]:
        diet_guardrail = "DIET SCOPE (Applies ONLY when user explicitly asks about food, meals, recipes, or nutrition): The user is strictly VEGETARIAN. Suggest vegetarian proteins like lentils, paneer, tofu, or whey. NEVER mention dietary preferences or use phrases like 'vegetarian-friendly options' when discussing gym exercises, core training, or lifting!"
    elif food_pref in ["NONVEG", "NON-VEG", "NON_VEG"]:
        diet_guardrail = "DIET SCOPE: The user is Non-Vegetarian. You may recommend lean meats, poultry, fish, eggs, and dairy alongside plant foods when discussing nutrition."
    else:
        diet_guardrail = "DIET SCOPE: Recommend healthy, wholesome foods."

    if med_history.upper() not in ["NONE", "NONE SPECIFIED", "N/A", ""]:
        medical_guardrail = f"CRITICAL MEDICAL CONSTRAINT: The user is actively managing {med_history}. Prioritize safety for this condition across all recommendations."
    else:
        medical_guardrail = "MEDICAL NOTE: No specific medical conditions reported."

    # Format recent workouts cleanly into human-readable compact text (saves ~300 tokens)
    if workout_data:
        formatted_workouts = []
        for w in workout_data:
            d = w.get("date", "")
            notes = w.get("notes", "")
            name = w.get("name", "Workout")
            detail = name
            if notes:
                try:
                    p = json.loads(notes)
                    detail = f"{p.get('exercise', name)} ({p.get('sets', 0)} sets x {p.get('reps', 0)} reps @ {p.get('weight', 0)}kg)"
                except Exception:
                    detail = f"{name} ({notes})"
            formatted_workouts.append(f"- {d}: {detail}")
        workout_str = "\n".join(formatted_workouts)
    else:
        workout_str = "No recent exercises logged yet."

    # Format chat history cleanly and truncate lengthy past turns to conserve tokens
    if chat_history_data:
        formatted_history = []
        for msg in chat_history_data:
            role = "User" if msg.get("role") == "user" else "Coach"
            text = str(msg.get("content", "")).strip()
            # Omit internal engine error messages if previously saved
            if "Inference Error:" in text:
                continue
            # Trim lengthy past messages so they don't blow out the prompt
            if len(text) > 250:
                text = text[:250] + "..."
            formatted_history.append(f"{role}: {text}")
        history_str = "\n".join(formatted_history) if formatted_history else "No prior conversation context."
    else:
        history_str = "No prior conversation context."

    context = f"""
    [FITWISE ATHLETE PROFILE]
    - Age: {age} | Gender: {gender} | Weight: {weight} kg | Goal: {goal}
    - Dietary Preference: {food_pref} | Medical History: {med_history}
    
    [RECENT WORKOUT LOGS]
    {workout_str}

    [RECENT CONVERSATION HISTORY]
    {history_str}
    """

    full_prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are FitWise Coach, an elite, authentic personal fitness and sports nutrition AI.

STRICT CONVERSATIONAL & AUTHENTICITY RULES:
1. ANSWER DIRECTLY: Answer the user's question immediately in the first sentence.
2. BREVITY FIRST: If the user asks a quick, specific, or binary question (e.g., "with pull we do abs or planks"), answer in 2 to 4 punchy, conversational sentences.
3. NO ESSAYS OR BULLETS FOR QUICK QUESTIONS: Do NOT write numbered lists, 5-paragraph routines, or generic disclaimers unless the user explicitly typed "make a plan", "create a routine", or asks for a full workout schedule.
4. NO UNPROMPTED LOG SUMMARIES: Do NOT recite the user's past workout logs unless they asked you to review their session.
5. NEVER COMBINE DIET WITH EXERCISE: NEVER use words like "vegetarian-friendly" or "vegan" when recommending exercises or core workouts!

{diet_guardrail}

{medical_guardrail}

Athlete Context:
{context}
<|eot_id|><|start_header_id|>user<|end_header_id|>
{req.prompt}
<|eot_id|><|start_header_id|>assistant<|end_header_id|>"""

    if MOCK_AI:
        return {"response": "[MOCK MODE] Context packed successfully."}

    # Dynamically clamp max_tokens so prompt_tokens + safe_max_tokens never exceeds n_ctx (4096)
    N_CTX = 4096
    try:
        prompt_tokens = len(llm.tokenize(full_prompt.encode("utf-8")))
    except Exception:
        prompt_tokens = len(full_prompt) // 3  # safe heuristic fallback
    
    # Guarantee max_tokens never overflows the context window
    safe_max_tokens = max(128, min(768, N_CTX - prompt_tokens - 32))

    # For quick conversational questions, strictly cap max_tokens so the model cannot generate long essays
    plan_keywords = ["routine", "workout plan", "diet plan", "meal plan", "schedule", "split", "program", "recipe", "table"]
    is_plan_request = any(kw in req.prompt.lower() for kw in plan_keywords)
    if not is_plan_request and len(req.prompt.strip()) < 160:
        safe_max_tokens = min(200, safe_max_tokens)

    # Generator function for SSE streaming
    async def token_generator():
        try:
            streamer = llm(
                full_prompt,
                max_tokens=safe_max_tokens,
                temperature=0.4,
                stop=["<|eot_id|>", "<|start_header_id|>", "<|end_header_id|>"],
                echo=False,
                stream=True  # Enables token-by-token generation
            )
            for output in streamer:
                token = output['choices'][0]['text']
                yield token
        except Exception as e:
            yield f"Inference Error: {str(e)}"

    return StreamingResponse(token_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)