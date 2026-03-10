import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import engine
from models import Base
from routes.auth import router as auth_router
from routes.workouts import router as workouts_router

app = FastAPI(
    title="FitWise API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)
Base.metadata.create_all(bind=engine)


frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"status": "FitWise API running"}


app.include_router(auth_router)
app.include_router(workouts_router)
