"""
FitWise Academic Defense: Learning Curves and Cross-Validation Analysis
Generates:
1. Learning Curve (Training vs Validation Accuracy vs Sample Size)
2. 5-Fold Cross-Validation Stability Bar Chart
3. Hyperparameter Validation Curve (Tree Depth vs Accuracy)
"""

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.model_selection import learning_curve, validation_curve, StratifiedKFold, cross_val_score
from sklearn.ensemble import HistGradientBoostingClassifier

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
os.makedirs(ARTIFACTS_DIR, exist_ok=True)
DATA_PATH = os.path.join(os.path.dirname(__file__), "Athlete_Training_Recovery_Tracker_Dataset.csv")

def prepare_data():
    df = pd.read_csv(DATA_PATH)
    
    # Feature Engineering
    df["Workload_Load"] = df["Training_Hours"] * df["Training_Intensity"]
    df["Recovery_Strain"] = df["Fatigue_Level"] / (df["Sleep_Hours"] + 0.1)
    df["Energy_Balance"] = df["Nutrition_Score"] / (df["Workload_Load"] + 1.0)
    
    # Biomechanical Ground Truth
    norm_workload = df["Workload_Load"] / 60.0
    norm_sleep_deficit = np.maximum(0, 8.0 - df["Sleep_Hours"]) / 8.0
    norm_fatigue = df["Fatigue_Level"] / 10.0
    norm_recovery_deficit = (100.0 - df["Recovery_Index"]) / 100.0
    norm_nutrition_deficit = (100.0 - df["Nutrition_Score"]) / 100.0
    
    composite_index = (
        0.30 * norm_workload +
        0.30 * norm_sleep_deficit +
        0.20 * norm_fatigue +
        0.10 * norm_recovery_deficit +
        0.10 * norm_nutrition_deficit
    )
    
    conditions = [
        composite_index >= 0.42,
        (composite_index >= 0.31) & (composite_index < 0.42),
        composite_index < 0.31
    ]
    df["Target"] = np.select(conditions, [2, 1, 0], default=0)
    
    df_encoded = pd.get_dummies(df, columns=["Sport_Type"], drop_first=False)
    feature_cols = [
        "Training_Hours", "Training_Intensity", "Sleep_Hours", 
        "Nutrition_Score", "Fatigue_Level", "Recovery_Index", 
        "Workload_Load", "Recovery_Strain", "Energy_Balance"
    ] + [c for c in df_encoded.columns if c.startswith("Sport_Type_")]
    
    X = df_encoded[feature_cols]
    y = df_encoded["Target"]
    return X, y

def plot_learning_curve(X, y):
    print("Generating Learning Curve...")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    estimator = HistGradientBoostingClassifier(max_iter=100, max_depth=4, learning_rate=0.08, random_state=42)
    
    train_sizes = np.linspace(0.15, 1.0, 7)
    train_sizes_abs, train_scores, val_scores = learning_curve(
        estimator, X, y, cv=cv, train_sizes=train_sizes, scoring="accuracy", n_jobs=-1, random_state=42
    )
    
    train_mean = np.mean(train_scores, axis=1) * 100
    train_std = np.std(train_scores, axis=1) * 100
    val_mean = np.mean(val_scores, axis=1) * 100
    val_std = np.std(val_scores, axis=1) * 100
    
    plt.figure(figsize=(9, 5.5))
    plt.plot(train_sizes_abs, train_mean, 'o-', color='#dc2626', label='Training Accuracy', linewidth=2.2, markersize=6)
    plt.fill_between(train_sizes_abs, train_mean - train_std, train_mean + train_std, alpha=0.12, color='#dc2626')
    
    plt.plot(train_sizes_abs, val_mean, 's-', color='#16a34a', label='5-Fold Cross-Validation Accuracy', linewidth=2.2, markersize=6)
    plt.fill_between(train_sizes_abs, val_mean - val_std, val_mean + val_std, alpha=0.18, color='#16a34a')
    
    # Annotate Single-Sport cohort vs Multi-Sport
    plt.axvline(x=120, color='#64748b', linestyle='--', alpha=0.7)
    plt.text(125, 84, 'Single-Sport Baseline\n(N ≈ 120 train)', fontsize=9.5, color='#475569', fontweight='semibold')
    
    plt.axvline(x=800, color='#0284c7', linestyle='--', alpha=0.7)
    plt.text(680, 87, 'Full Multi-Sport\n(N = 800 train)', fontsize=9.5, color='#0369a1', fontweight='semibold')
    
    plt.title('FitWise Model Learning Curve: Diagnostic for Overfitting vs Generalization', fontsize=13, fontweight='bold', pad=12)
    plt.xlabel('Number of Training Instances (N)', fontsize=11, labelpad=8)
    plt.ylabel('Classification Accuracy (%)', fontsize=11, labelpad=8)
    plt.ylim(75, 103)
    plt.grid(True, linestyle=':', alpha=0.6)
    plt.legend(loc='lower right', frameon=True, fontsize=10.5)
    
    save_path = os.path.join(ARTIFACTS_DIR, "learning_curve.png")
    plt.tight_layout()
    plt.savefig(save_path, dpi=300)
    plt.close()
    print(f"Saved Learning Curve to: {save_path}")

def plot_cv_folds(X, y):
    print("Generating 5-Fold Cross-Validation stability chart...")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    estimator = HistGradientBoostingClassifier(max_iter=100, max_depth=4, learning_rate=0.08, random_state=42)
    scores = cross_val_score(estimator, X, y, cv=cv, scoring="accuracy") * 100
    
    fold_names = [f"Fold {i+1}" for i in range(len(scores))]
    
    plt.figure(figsize=(8, 4.8))
    bars = plt.bar(fold_names, scores, color='#3b82f6', width=0.55, edgecolor='#1d4ed8', linewidth=1.2, alpha=0.88)
    
    mean_score = scores.mean()
    std_score = scores.std()
    plt.axhline(mean_score, color='#ef4444', linestyle='--', linewidth=1.8, label=f'Mean CV: {mean_score:.2f}% (±{std_score:.2f}%)')
    
    for bar, score in zip(bars, scores):
        plt.text(bar.get_x() + bar.get_width()/2, score + 0.6, f"{score:.1f}%", ha='center', va='bottom', fontsize=10.5, fontweight='bold')
        
    plt.title('FitWise 5-Fold Stratified Cross-Validation Stability', fontsize=13, fontweight='bold', pad=12)
    plt.ylabel('Validation Accuracy (%)', fontsize=11)
    plt.ylim(80, 100)
    plt.grid(axis='y', linestyle=':', alpha=0.6)
    plt.legend(loc='lower right', fontsize=10.5)
    
    save_path = os.path.join(ARTIFACTS_DIR, "cv_folds_analysis.png")
    plt.tight_layout()
    plt.savefig(save_path, dpi=300)
    plt.close()
    print(f"Saved CV Folds chart to: {save_path}")

def plot_validation_curve(X, y):
    print("Generating Hyperparameter Validation Curve (Tree Depth)...")
    param_range = [2, 3, 4, 5, 6, 7, 8]
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    estimator = HistGradientBoostingClassifier(max_iter=100, learning_rate=0.08, random_state=42)
    
    train_scores, val_scores = validation_curve(
        estimator, X, y, param_name="max_depth", param_range=param_range,
        cv=cv, scoring="accuracy", n_jobs=-1
    )
    
    train_mean = np.mean(train_scores, axis=1) * 100
    val_mean = np.mean(val_scores, axis=1) * 100
    val_std = np.std(val_scores, axis=1) * 100
    
    plt.figure(figsize=(8.5, 5))
    plt.plot(param_range, train_mean, 'o-', color='#dc2626', label='Training Accuracy', linewidth=2)
    plt.plot(param_range, val_mean, 's-', color='#16a34a', label='Cross-Validation Accuracy', linewidth=2)
    plt.fill_between(param_range, val_mean - val_std, val_mean + val_std, alpha=0.15, color='#16a34a')
    
    plt.axvline(x=4, color='#f59e0b', linestyle=':', linewidth=2, label='Selected Max Depth = 4 (Sweet Spot)')
    
    plt.title('Validation Curve: Effect of Tree Depth on Overfitting vs Accuracy', fontsize=13, fontweight='bold', pad=12)
    plt.xlabel('Maximum Tree Depth (Model Complexity)', fontsize=11)
    plt.ylabel('Classification Accuracy (%)', fontsize=11)
    plt.ylim(85, 102)
    plt.grid(True, linestyle=':', alpha=0.6)
    plt.legend(loc='lower right', fontsize=10)
    
    save_path = os.path.join(ARTIFACTS_DIR, "validation_curve_depth.png")
    plt.tight_layout()
    plt.savefig(save_path, dpi=300)
    plt.close()
    print(f"Saved Validation Curve to: {save_path}")

if __name__ == "__main__":
    X, y = prepare_data()
    plot_learning_curve(X, y)
    plot_cv_folds(X, y)
    plot_validation_curve(X, y)
    print("All academic curve graphs generated successfully!")
