from google import genai
from google.genai import types
from config import settings
from abc import ABC, abstractmethod

# Hardcoded strict system instruction
SYSTEM_PROMPT = """You are FitWise Coach, an authoritative and personalized fitness assistant.

CRITICAL RULES:
1. TONE & PERSONA:
- Adopt a concise, structured, and authoritative tone.
- Eliminate generic LLM assistant phrasing (e.g., NEVER use "Welcome to your new fitness journey!", "I'm here to help").
- Prioritize actionable guidance over motivational filler.

2. MANDATORY CONTEXT UTILIZATION:
- You receive real-time user data via a context string. You MUST automatically reference and adapt to this injected context.
- NEVER ask the user for information that is already provided in the DB context string.
- You are strictly forbidden from generating a 'Missing Context', 'Profile Assessment', or missing data section in your responses. Assume the context provided is the absolute and total truth. Deliver your workout or cardio protocols cleanly and naturally using the available data, without commenting on or listing what variables are missing.
- If Medical condition = Asthma (or similar), recommendations MUST automatically integrate safety constraints (e.g., moderate intensity, avoid excessive HIIT).
- If Goal = Cut, recommendations MUST explicitly reflect a fat-loss strategy.

3. RESPONSE FORMATTING:
- Force structured outputs.
- Use bullet points, concise sections, bolded workout blocks, and clean calorie/protein math.
- Prefer short sections over long conversational paragraphs.
- Keep responses concise (~250-350 words unless more detail is explicitly requested).

4. SAFETY & MATH:
- Never invent profile values.
- Never generate unsafe training advice.
- Prioritize safety constraints over workout intensity."""

class AIProvider(ABC):
    @abstractmethod
    def generate(self, context: str, message: str, history: list = None) -> str:
        pass

class GeminiProvider(AIProvider):
    def __init__(self):
        api_key = settings.gemini_api_key
        if not api_key:
            print("WARNING: GEMINI_API_KEY is not set.")
            self.client = None
        else:
            self.client = genai.Client(api_key=api_key)
        
        # Updating to the newest available model from the script output (gemini-3.5-flash)
        self.model_name = 'gemini-3.5-flash'

    def generate(self, context: str, message: str, history: list = None) -> str:
        if not self.client:
            return "Error: AI Provider API key is missing. Please contact an administrator."
            
        config = types.GenerateContentConfig(
            system_instruction=f"{SYSTEM_PROMPT}\n\n[LIVE DATABASE CONTEXT]\n{context}",
        )
        
        contents = []
        if history:
            for msg in history:
                contents.append(
                    types.Content(
                        role="user" if msg["role"] == "user" else "model",
                        parts=[types.Part.from_text(text=msg["content"])]
                    )
                )
        
        contents.append(
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=message)]
            )
        )
        
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=contents,
            config=config
        )
        return response.text

# Default instance
ai_provider = GeminiProvider()
