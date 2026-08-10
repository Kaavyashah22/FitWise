import os
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
            n_ctx=2048,      
            verbose=False    
        )
        print(f"🚀 Success: Llama.cpp engine loaded seamlessly on Apple Metal GPU!")
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
        chat_response = supabase.table("chat_messages").select("*").eq("user_id", req.user_id).eq("session_id", req.session_id).order("created_at", desc=True).limit(3).execute()
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

    # DYNAMIC GUARDRAILS
    if food_pref == "VEGAN":
        diet_guardrail = "MANDATORY DIET CONSTRAINT: The user is strictly VEGAN. You are completely forbidden from suggesting meat, poultry, fish, eggs, dairy, or any animal-derived products. ONLY suggest 100% plant-based foods."
    elif food_pref == "VEGETARIAN" or food_pref == "VEG":
        diet_guardrail = "MANDATORY DIET CONSTRAINT: The user is VEGETARIAN. Do not suggest meat, poultry, or fish. You may suggest dairy and eggs."
    else:
        diet_guardrail = "DIET NOTE: The user is Non-Vegetarian. You may recommend a balanced diet including lean meats, poultry, fish, eggs, dairy, as well as plant-based options."

    if med_history.upper() not in ["NONE", "NONE SPECIFIED", "N/A", ""]:
        medical_guardrail = f"MANDATORY MEDICAL CONSTRAINT: The user is actively managing {med_history}. You MUST explicitly acknowledge this in your response (e.g., 'Since you are managing {med_history}...') and ensure all exercise and dietary advice is strictly safe and tailored for this condition."
    else:
        medical_guardrail = "MEDICAL NOTE: No specific medical conditions reported. Standard fitness guidelines apply."

    context = f"""
    [FITWISE CRITICAL PROFILE]
    - Age: {age}
    - Gender: {gender}
    - Current Weight: {weight} kg
    - Medical History: {med_history}
    - Primary Fitness Goal: {goal}
    - DIETARY PREFERENCE: {food_pref}
    
    [RECENT EXERCISE WORKOUT LOGS]
    {workout_data if workout_data else 'No recent exercises logged yet.'}

    [RECENT CONVERSATION HISTORY]
    {chat_history_data if chat_history_data else 'No prior conversation context.'}
    """

    FORMATTING_GUIDELINE = """
    MANDATORY FORMATTING RULES:
    1. You MUST format all responses using rich Markdown.
    2. Use ## Headings for main sections (e.g., ## Your Next Workout, ## Nutrition Focus).
    3. Use **bold** text to highlight key exercises, metrics, or important concepts.
    4. Use bullet points (-) or numbered lists for all workout plans and step-by-step advice.
    5. Be energetic! Generously sprinkle highly relevant emojis (e.g., 💪, 🏃‍♂️, 🥗, 🔥, 🏋️‍♀️) throughout your response to make it visually engaging and highly motivating.
    6. Keep paragraphs very short and punchy for easy reading.
    """

    full_prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
    You are FitWise Coach, an elite personal fitness and nutrition intelligence assistant. 
    You must thoroughly evaluate the user's specific metrics, medical realities, and training logs before responding.
    
    {diet_guardrail}
    
    {medical_guardrail}
    
    MANDATORY TRAINING LINKAGE:
    Acknowledge or reference their recent exercise history (e.g., if they did leg days, squats, or volume work) when framing recovery, targets, or nutritional guidance. Keep advice highly personalized.
    
    {FORMATTING_GUIDELINE}
    
    CONVERSATIONAL MEMORY: Review the [RECENT CONVERSATION HISTORY] to maintain context. If the user refers to previous advice or recipes, use this history to provide a coherent continuation.
    
    User Context Data File:
    {context}
    <|eot_id|><|start_header_id|>user<|end_header_id|>
    {req.prompt}
    <|eot_id|><|start_header_id|>assistant<|end_header_id|>"""

    if MOCK_AI:
        return {"response": "[MOCK MODE] Context packed successfully."}

    # Generator function for SSE streaming
    async def token_generator():
        try:
            streamer = llm(
                full_prompt,
                max_tokens=1024,
                temperature=0.4,
                stop=["<|eot_id|>"],
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