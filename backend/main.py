from fastapi import FastAPI  # pyright: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware  # pyright: ignore[reportMissingImports]
from db import engine
from models import Base
from routes.auth import router as auth_router
from routes.workouts import router as workouts_router
from routes.predict import router as predict_router
from routes.coach import router as coach_router
from routes.profile import router as profile_router
from routes.metrics import router as metrics_router
from routes.coach import limiter
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from config import settings

app = FastAPI(
    title="FitWise API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

print("✅ Application starting up. Database managed via Alembic.")

# ---- CORS FIX ----
frontend_origin = settings.frontend_origin

allow_origins = [
    "http://localhost:5173",
    "http://localhost:8080",
]

if frontend_origin:
    allow_origins.append(frontend_origin)


app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ------------------


@app.get("/")
def read_root():
    return {"status": "FitWise API running"}


app.include_router(auth_router)
app.include_router(workouts_router)
app.include_router(predict_router)
app.include_router(profile_router, prefix="/api/v1/profile")
app.include_router(coach_router, prefix="/api/v1/coach")
app.include_router(metrics_router, prefix="/api/v1")