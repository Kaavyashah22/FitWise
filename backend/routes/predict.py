import os
from typing import Literal, Optional

import joblib  # pyright: ignore[reportMissingImports]
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from plans import generate_plan


router = APIRouter(tags=["predict"])


# Resolve backend root (where model_*.pkl live)
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

try:
    model_cut = joblib.load(os.path.join(BACKEND_DIR, "model_cut.pkl"))
    scaler_cut = joblib.load(os.path.join(BACKEND_DIR, "scaler_cut.pkl"))

    model_bulk = joblib.load(os.path.join(BACKEND_DIR, "model_bulk.pkl"))
    scaler_bulk = joblib.load(os.path.join(BACKEND_DIR, "scaler_bulk.pkl"))

    model_maintain = joblib.load(os.path.join(BACKEND_DIR, "model_maintain.pkl"))
    scaler_maintain = joblib.load(os.path.join(BACKEND_DIR, "scaler_maintain.pkl"))

    le_plan = joblib.load(os.path.join(BACKEND_DIR, "le_plan.pkl"))
    le_gender = joblib.load(os.path.join(BACKEND_DIR, "le_gender.pkl"))
    le_activity = joblib.load(os.path.join(BACKEND_DIR, "le_activity.pkl"))
except FileNotFoundError as exc:  # pragma: no cover
    raise RuntimeError("AI model or encoder files are missing in backend directory.") from exc


class PredictRequest(BaseModel):
    age: int = Field(..., ge=1)
    height: float = Field(..., gt=0)  # cm
    weight: float = Field(..., gt=0)  # kg
    gender: str  # "male" / "female"
    activity: str  # "sedentary" / anything else -> "Active"
    goal: Literal["cut", "bulk", "maintain"]
    food_type: Optional[str] = "nonveg"
    medical_history: Optional[str] = "None"


@router.post("/predict")
def predict_plan(payload: PredictRequest):
    """
    Mirror the existing Flask /predict endpoint, returning the same plan structure.
    """
    try:
        age = int(payload.age)
        weight = float(payload.weight)
        height = float(payload.height)
        goal = payload.goal.lower()
        gender = payload.gender.capitalize()
        food_type = payload.food_type or "nonveg"

        activity_raw = payload.activity
        # Map UI activity levels to model-supported labels (same as Flask logic)
        if activity_raw.lower() == "sedentary":
            activity = "Sedentary"
        else:
            activity = "Active"

        gender_encoded = le_gender.transform([gender])[0]
        activity_encoded = le_activity.transform([activity])[0]

        new_user_data = [[age, weight, height, gender_encoded, activity_encoded]]

        prediction_encoded = None
        confidence = None

        if goal == "cut":
            data_scaled = scaler_cut.transform(new_user_data)
            prediction_encoded = model_cut.predict(data_scaled)
            confidence = max(model_cut.predict_proba(data_scaled)[0])
        elif goal == "bulk":
            data_scaled = scaler_bulk.transform(new_user_data)
            prediction_encoded = model_bulk.predict(data_scaled)
            confidence = max(model_bulk.predict_proba(data_scaled)[0])
        elif goal == "maintain":
            data_scaled = scaler_maintain.transform(new_user_data)
            prediction_encoded = model_maintain.predict(data_scaled)
            confidence = max(model_maintain.predict_proba(data_scaled)[0])

        if prediction_encoded is None:
            raise HTTPException(status_code=400, detail="Invalid goal provided")

        final_plan_key = le_plan.inverse_transform(prediction_encoded)[0]

        bmi = weight / ((height / 100) ** 2)

        full_plan = generate_plan(
            plan_key=final_plan_key,
            age=age,
            bmi=bmi,
            activity=activity,
            goal=goal,
            confidence=confidence,
            food_type=food_type,
            medical_history=payload.medical_history,
        )

        return full_plan

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

