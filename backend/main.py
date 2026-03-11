import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from db import engine
from models import Base
from routes.auth import router as auth_router
from routes.workouts import router as workouts_router

load_dotenv()

app = FastAPI(
    title="FitWise API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

try:
    Base.metadata.create_all(bind=engine)
except OperationalError as exc:
    raise RuntimeError(
        "Database initialization failed. "
        "Check that DATABASE_URL is set correctly and the PostgreSQL server is reachable."
    ) from exc


# ---- CORS FIX ----
frontend_origin = os.getenv("FRONTEND_ORIGIN")

allow_origins = [
    "http://localhost:5173",
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