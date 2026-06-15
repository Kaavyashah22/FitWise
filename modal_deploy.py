import modal

image = (
    modal.Image.from_registry("nvidia/cuda:12.1.1-devel-ubuntu22.04", add_python="3.11")
    .pip_install(
        "fastapi",
        "uvicorn",
        "pydantic",
        "huggingface_hub",
        "supabase",
        "python-dotenv"
    )
    .run_commands("pip install llama-cpp-python --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cu121")
    .add_local_dir("backend", remote_path="/root/backend", ignore=["venv/**", ".venv/**", "__pycache__/**", "fitwise_mac_ready_model/**"])
)

app = modal.App("fitwise-ai-backend")

# 2. Provision a Serverless T4 GPU and inject the Hugging Face Token
@app.function(
    image=image,
    gpu="T4",
    secrets=[modal.Secret.from_name("my-huggingface-secret")],
    min_containers=0,
    max_containers=1, # Hard cap at 1 container to strictly limit credit burn
    scaledown_window=60 # Shut down the GPU after 60 seconds of inactivity
)
@modal.asgi_app()
def fastapi_app():
    import sys
    
    # THE PATHING SLEDGEHAMMER: Force Python to look in the /root directory
    if "/root" not in sys.path:
        sys.path.append("/root")
        
    # Import the FastAPI instance from the existing backend module
    from backend.ai_coach import app as web_app
    return web_app