"""
FitWise Injury Prediction Pipeline
Academic Experiment:
- Formulate Ground Truth Injury Risk using established Biomechanical Load-Recovery Equations
- Experiment 1: Single-Sport Proof-of-Concept (Athletics)
- Experiment 2: Generalized Multi-Sport Gradient Boosted Decision Tree (GBDT) Model
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score

DATA_PATH = os.path.join(os.path.dirname(__file__), "Athlete_Training_Recovery_Tracker_Dataset.csv")
ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

def load_and_preprocess():
    print(f"Loading dataset from: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    
    # Feature Engineering (Biomechanical Interaction Terms)
    # 1. Total Workload = Training Hours * Intensity (Volume Proxy)
    df["Workload_Load"] = df["Training_Hours"] * df["Training_Intensity"]
    
    # 2. Fatigue to Sleep Ratio (Compounding Sleep Debt)
    df["Recovery_Strain"] = df["Fatigue_Level"] / (df["Sleep_Hours"] + 0.1)
    
    # 3. Nutrition to Workload Balance
    df["Energy_Balance"] = df["Nutrition_Score"] / (df["Workload_Load"] + 1.0)
    
    # 4. Biomechanical Ground Truth Formulation (BGT)
    # Using sports science multi-factorial load-recovery weighting
    norm_workload = df["Workload_Load"] / 60.0                     # Normalized Workload
    norm_sleep_deficit = np.maximum(0, 8.0 - df["Sleep_Hours"]) / 8.0  # Normalized Sleep Debt
    norm_fatigue = df["Fatigue_Level"] / 10.0                       # Normalized Soreness
    norm_recovery_deficit = (100.0 - df["Recovery_Index"]) / 100.0   # Recovery Deficit
    norm_nutrition_deficit = (100.0 - df["Nutrition_Score"]) / 100.0 # Dietary Deficit
    
    composite_index = (
        0.30 * norm_workload +
        0.30 * norm_sleep_deficit +
        0.20 * norm_fatigue +
        0.10 * norm_recovery_deficit +
        0.10 * norm_nutrition_deficit
    )
    
    # Stratified target thresholds
    # High: Top ~12% highest risk
    # Medium: Next ~28%
    # Low: Baseline ~60%
    conditions = [
        composite_index >= 0.42,
        (composite_index >= 0.31) & (composite_index < 0.42),
        composite_index < 0.31
    ]
    # Classes: 2=High, 1=Medium, 0=Low
    df["Target"] = np.select(conditions, [2, 1, 0], default=0)
    df["Injury_Risk_Label"] = np.select(conditions, ["High", "Medium", "Low"], default="Low")
    
    print("Class distribution after Biomechanical Ground Truth formulation:")
    print(df["Injury_Risk_Label"].value_counts())
    
    return df

def run_experiment_1_single_sport(df, sport_name="Athletics"):
    print("\n" + "=" * 60)
    print(f"EXPERIMENT 1: SINGLE-SPORT POC ({sport_name.upper()})")
    print("=" * 60)
    
    sport_df = df[df["Sport_Type"] == sport_name].copy()
    print(f"Samples in {sport_name}: {len(sport_df)}")
    
    feature_cols = [
        "Training_Hours", "Training_Intensity", "Sleep_Hours", 
        "Nutrition_Score", "Fatigue_Level", "Recovery_Index", 
        "Workload_Load", "Recovery_Strain", "Energy_Balance"
    ]
    
    X = sport_df[feature_cols]
    y = sport_df["Target"]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )
    
    model = HistGradientBoostingClassifier(
        max_iter=100,
        max_depth=4,
        learning_rate=0.08,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="macro")
    print(f"\nSingle-Sport Test Accuracy: {acc * 100:.2f}%")
    print(f"Single-Sport Macro F1 Score: {f1 * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Low", "Medium", "High"], zero_division=0))
    
    return model, feature_cols

def run_experiment_2_multisport(df):
    print("\n" + "=" * 60)
    print("EXPERIMENT 2: GENERALIZED MULTI-SPORT GBDT MODEL (1,000 SAMPLES)")
    print("=" * 60)
    
    # One-hot encode sport type so the model knows sport-specific baselines
    df_encoded = pd.get_dummies(df, columns=["Sport_Type"], drop_first=False)
    
    feature_cols = [
        "Training_Hours", "Training_Intensity", "Sleep_Hours", 
        "Nutrition_Score", "Fatigue_Level", "Recovery_Index", 
        "Workload_Load", "Recovery_Strain", "Energy_Balance"
    ] + [c for c in df_encoded.columns if c.startswith("Sport_Type_")]
    
    X = df_encoded[feature_cols]
    y = df_encoded["Target"]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    # Cross Validation (5-Fold Stratified)
    kfold = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_model = HistGradientBoostingClassifier(
        max_iter=120,
        max_depth=5,
        learning_rate=0.06,
        random_state=42
    )
    
    cv_scores = cross_val_score(cv_model, X, y, cv=kfold, scoring="accuracy")
    print(f"\n5-Fold Cross Validation Accuracy: {cv_scores.mean() * 100:.2f}% (+/- {cv_scores.std() * 100:.2f}%)")
    
    # Train Final Production Model
    final_model = HistGradientBoostingClassifier(
        max_iter=120,
        max_depth=5,
        learning_rate=0.06,
        random_state=42
    )
    final_model.fit(X_train, y_train)
    
    y_pred = final_model.predict(X_test)
    test_acc = accuracy_score(y_test, y_pred)
    test_f1 = f1_score(y_test, y_pred, average="macro")
    
    print(f"\nFinal Test Accuracy: {test_acc * 100:.2f}%")
    print(f"Final Test Macro F1 Score: {test_f1 * 100:.2f}%")
    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Low", "Medium", "High"], zero_division=0))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    # Feature Importances for Explainable AI (XAI)
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    
    print("\nTop 7 Predictor Features (Feature Importance via Random Forest):")
    importances = rf.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    feature_importance_dict = {}
    for rank, idx in enumerate(sorted_idx[:7], 1):
        feature_importance_dict[feature_cols[idx]] = float(importances[idx])
        print(f" {rank}. {feature_cols[idx]:22s}: {importances[idx] * 100:.2f}%")
        
    # Save artifacts for FastAPI inference
    model_path = os.path.join(ARTIFACTS_DIR, "injury_model.pkl")
    features_path = os.path.join(ARTIFACTS_DIR, "feature_names.pkl")
    importance_path = os.path.join(ARTIFACTS_DIR, "feature_importance.pkl")
    
    joblib.dump(final_model, model_path)
    joblib.dump(feature_cols, features_path)
    joblib.dump(feature_importance_dict, importance_path)
    print(f"\nModel artifacts successfully saved to:\n- {model_path}\n- {features_path}\n- {importance_path}")

if __name__ == "__main__":
    df = load_and_preprocess()
    run_experiment_1_single_sport(df, sport_name="Athletics")
    run_experiment_2_multisport(df)
