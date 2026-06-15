import json
import os
from datetime import datetime

# Store logs at the root of the backend directory
LOG_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "rag_logs.jsonl")

def log_rag_interaction(context: str, question: str, response: str):
    """
    Logs the RAG payload structure into a .jsonl file.
    Excludes sensitive user information (like user_id, name, email).
    Intended for future LoRA fine-tuning dataset generation.
    """
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "context": context,
        "question": question,
        "response": response
    }
    
    try:
        with open(LOG_FILE_PATH, "a") as f:
            f.write(json.dumps(log_entry) + "\n")
    except Exception as e:
        print(f"Error writing to RAG log: {e}")
