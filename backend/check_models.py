import os
from google import genai
from dotenv import load_dotenv

def check_available_models():
    # Load environment variables from .env
    load_dotenv()
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "insert_new_key_here":
        print("❌ Error: Please set your GEMINI_API_KEY in the backend/.env file first!")
        return

    try:
        print("Authenticating with Gemini API...")
        client = genai.Client(api_key=api_key)
        
        print("\n✅ Successfully authenticated! Fetching available models for your API key...\n")
        
        available_models = []
        for model in client.models.list():
            available_models.append(model.name)
                
        print("Available Models for Chat:")
        for name in available_models:
            print(f" - {name}")
            
        print("\nIf 'gemini-2.0-flash' gave you a limit: 0 error, you might be in a region without a free tier.")
    except Exception as e:
        print(f"\n❌ API Error: {e}")

if __name__ == "__main__":
    check_available_models()
