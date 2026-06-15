import modal

image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "fastapi",
        "uvicorn",
        "pydantic",
        "huggingface_hub",
        "supabase",
        "python-dotenv"
    )
    .run_commands("pip install llama-cpp-python --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cu121")
)

app = modal.App("fitwise-ai-backend")

# 2. Provision a Serverless T4 GPU and inject the Hugging Face Token
@app.function(
    image=image,
    gpu="T4", # Highly cost-effective GPU for 8B quantized models
    secrets=[modal.Secret.from_name("my-huggingface-secret")],
    keep_warm=0 # Scales to zero when inactive so free credits are not wasted
)
@modal.asgi_app()
def fastapi_app():
    # Import the FastAPI instance from the existing backend module
    from backend.ai_coach import app as web_app
    return web_app
