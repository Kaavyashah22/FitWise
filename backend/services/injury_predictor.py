"""
FitWise Injury Prediction Service
Infers real-time injury risk for a user by mapping their daily check-in metrics
and workout volume into our trained Gradient Boosted Decision Tree (GBDT) pipeline.
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional

ARTIFACTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml", "artifacts")
MODEL_PATH = os.path.join(ARTIFACTS_DIR, "injury_model.pkl")
FEATURES_PATH = os.path.join(ARTIFACTS_DIR, "feature_names.pkl")
IMPORTANCE_PATH = os.path.join(ARTIFACTS_DIR, "feature_importance.pkl")

# In-memory cache for loaded model
_model = None
_feature_names = None
_feature_importances = None

def load_injury_model():
    global _model, _feature_names, _feature_importances
    if _model is None and os.path.exists(MODEL_PATH):
        try:
            _model = joblib.load(MODEL_PATH)
            _feature_names = joblib.load(FEATURES_PATH)
            _feature_importances = joblib.load(IMPORTANCE_PATH)
            print(" Injury Prediction Model successfully loaded.")
        except Exception as e:
            print(f"Failed to load injury model: {e}")
    return _model, _feature_names, _feature_importances

def predict_user_injury_risk(
    sleep_hours: Optional[float] = 7.0,
    soreness_score: Optional[int] = 3,
    caloric_adherence: Optional[int] = 85,
    volume_load: Optional[float] = 2500.0,
    training_intensity: Optional[int] = 6
) -> Dict[str, Any]:
    """
    Predicts injury risk probability (0-100%) and returns explainable factors.
    """
    model, feature_names, importances = load_injury_model()
    
    # Safe defaults if user hasn't logged everything today
    sleep = float(sleep_hours if sleep_hours is not None else 7.0)
    soreness = int(soreness_score if soreness_score is not None else 3)
    nutrition = int(caloric_adherence if caloric_adherence is not None else 85)
    intensity = int(training_intensity if training_intensity is not None else 6)
    
    # Estimated daily gym duration in hours based on volume
    training_hours = max(0.8, min(2.5, (volume_load or 2500.0) / 1800.0))
    
    # Biomechanical engineered metrics matching training pipeline
    workload_load = training_hours * intensity
    recovery_strain = soreness / (sleep + 0.1)
    energy_balance = nutrition / (workload_load + 1.0)
    
    # Computed Recovery Index (0-100 scale)
    base_recovery = max(20.0, min(100.0, (11 - soreness) * 8.0 + (sleep / 8.0) * 20.0))
    
    # Construct single-row DataFrame matching the exact training columns
    row_data = {
        "Training_Hours": training_hours,
        "Training_Intensity": intensity,
        "Sleep_Hours": sleep,
        "Nutrition_Score": nutrition,
        "Fatigue_Level": soreness,
        "Recovery_Index": base_recovery,
        "Workload_Load": workload_load,
        "Recovery_Strain": recovery_strain,
        "Energy_Balance": energy_balance
    }
    
    # Add sport one-hot columns (default to Athletics / General Conditioning)
    if feature_names:
        for col in feature_names:
            if col.startswith("Sport_Type_"):
                row_data[col] = 1 if col == "Sport_Type_Athletics" else 0
                
        df_input = pd.DataFrame([row_data])[feature_names]
    else:
        df_input = pd.DataFrame([row_data])

    if model is not None:
        probabilities = model.predict_proba(df_input)[0]  # [P(Low), P(Medium), P(High)]
        p_low = float(probabilities[0])
        p_med = float(probabilities[1]) if len(probabilities) > 1 else 0.0
        p_high = float(probabilities[2]) if len(probabilities) > 2 else 0.0
    else:
        # Heuristic fallback if model artifact not found
        p_high = 0.6 if (sleep < 5.5 and soreness > 7) else 0.1
        p_med = 0.4 if (sleep < 6.5 or soreness > 5) else 0.2
        p_low = max(0.0, 1.0 - (p_high + p_med))
        
    # Continuous Clinical Risk Score (0-100%)
    # Weighted impact: High probability contributes heavily, Medium moderately
    risk_score = int(np.clip((p_med * 0.45 + p_high * 0.95 + (1.0 - p_low) * 0.2) * 100, 5, 95))
    
    # Determine Tier
    if risk_score >= 65:
        risk_level = "High"
        color = "#ef4444"  # Red
        recommendation = "High risk of acute strain. Schedule a de-load or active recovery session today."
    elif risk_score >= 40:
        risk_level = "Moderate"
        color = "#f59e0b"  # Amber
        recommendation = "Moderate strain accumulated. Prioritize stretching and keep RPE under 7."
    else:
        risk_level = "Low"
        color = "#10b981"  # Emerald
        recommendation = "Optimal recovery profile. You are cleared for high-intensity training."
        
    # Explainable AI (XAI): Identify top 2 primary risk drivers for this user
    drivers = []
    if sleep < 6.5:
        drivers.append(f"Sleep Debt ({sleep:.1f} hrs vs recommended 7.5+ hrs)")
    if soreness >= 6:
        drivers.append(f"Elevated Muscular Soreness ({soreness}/10)")
    if workload_load > 12.0:
        drivers.append("High Acute Workload Spike")
    if nutrition < 70:
        drivers.append("Caloric / Macronutrient Deficit")
        
    if not drivers:
        drivers.append("Balanced Workload & Healthy Sleep Profile")

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "color": color,
        "recommendation": recommendation,
        "drivers": drivers,
        "metrics_evaluated": {
            "sleep_hours": sleep,
            "soreness_score": soreness,
            "caloric_adherence": nutrition,
            "estimated_workload": round(workload_load, 1),
            "recovery_index": round(base_recovery, 1)
        }
    }
