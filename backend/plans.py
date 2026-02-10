import random


def generate_plan(plan_key, age, bmi, activity, goal, confidence):

    # ------------------------
    # Age Group Logic
    # ------------------------
    if age >= 40:
        age_group = "senior"
    elif age >= 26:
        age_group = "adult"
    else:
        age_group = "young"

    # ------------------------
    # BMI-based tuning
    # ------------------------
    if bmi >= 30:
        intensity_note = "Higher cardio frequency due to elevated BMI."
    elif bmi >= 25:
        intensity_note = "Moderate calorie control and structured fat management."
    elif bmi < 18.5:
        intensity_note = "Increased calorie surplus for muscle gain."
    else:
        intensity_note = "Balanced calorie and structured hypertrophy approach."

    # ------------------------
    # Age-based recovery tuning
    # ------------------------
    if age_group == "senior":
        recovery_note = "Reduced joint stress and added mobility work."
    elif age_group == "adult":
        recovery_note = "Structured progression with proper recovery cycles."
    else:
        recovery_note = "Higher intensity progression suitable."

    # ------------------------
    # Goal-based meal pools
    # ------------------------
    if goal == "cut":
        meal_pool = [
            "Grilled chicken salad with olive oil",
            "Egg whites with spinach",
            "Baked salmon with broccoli",
            "Greek yogurt with chia seeds",
            "Lean turkey lettuce wraps",
            "Protein smoothie (low carb)",
            "Cottage cheese with almonds"
        ]
    elif goal == "bulk":
        meal_pool = [
            "Chicken rice bowl with avocado",
            "Oats with peanut butter and banana",
            "Steak with sweet potatoes",
            "Whole egg omelette with toast",
            "Protein shake with oats and milk",
            "Salmon with quinoa",
            "Greek yogurt with granola"
        ]
    else:  # maintain
        meal_pool = [
            "Balanced chicken plate with rice and veggies",
            "Omelette with whole grain toast",
            "Fish tacos with beans",
            "Protein smoothie with fruits",
            "Lean beef with brown rice",
            "Yogurt with nuts",
            "Tofu stir fry"
        ]

    # ------------------------
    # Workout Strategy Pool
    # ------------------------
    workout_pool = [
        "Push/Pull/Legs split",
        "Upper/Lower hypertrophy split",
        "Full body strength program",
        "HIIT + resistance combination",
        "Heavy compound lift focus"
    ]

    # ------------------------
    # Workout Split by Goal
    # ------------------------
    if goal == "cut":
        workout_split = [
            "Day 1: Full Body + Cardio",
            "Day 2: HIIT Conditioning",
            "Day 3: Upper Body Strength",
            "Day 4: Cardio Endurance",
            "Day 5: Lower Body + Core"
        ]
    elif goal == "bulk":
        workout_split = [
            "Day 1: Chest & Triceps",
            "Day 2: Back & Biceps",
            "Day 3: Rest",
            "Day 4: Legs (Heavy)",
            "Day 5: Shoulders & Arms"
        ]
    else:
        workout_split = [
            "Day 1: Upper Body",
            "Day 2: Lower Body",
            "Day 3: Cardio / Sport",
            "Day 4: Upper Hypertrophy",
            "Day 5: Lower Hypertrophy"
        ]

    # ------------------------
    # BMI Category Label
    # ------------------------
    if bmi >= 30:
        bmi_label = "Obese range"
    elif bmi >= 25:
        bmi_label = "Overweight range"
    elif bmi < 18.5:
        bmi_label = "Underweight range"
    else:
        bmi_label = "Normal range"

    # ------------------------
    # Activity Label
    # ------------------------
    activity_lower = activity.lower()

    if activity_lower in ["very active", "active"]:
        activity_label = "High activity pattern detected."
    elif activity_lower == "sedentary":
        activity_label = "Low activity level detected."
    else:
        activity_label = "Moderate activity pattern detected."

    # ------------------------
    # Plan Cluster Reference
    # ------------------------
    base_title = plan_key.replace("_", " ")
    cluster_note = f"Model assigned user to strategy cluster '{base_title}'."

    # ------------------------
    # Dynamic Explainability Layer
    # ------------------------
    explanation = (
        f"KNN classifier routed request to '{goal.upper()}' expert model. "
        f"{cluster_note} "
        f"BMI classification: {bmi_label}. "
        f"Age group: {age_group}. "
        f"{activity_label} "
        f"Adaptive tuning applied: {intensity_note} {recovery_note}"
    )

    # ------------------------
    # Final Response Object
    # ------------------------
    return {
        "title": f"{base_title} (AI Personalized)",
        "diet_strategy": f"{intensity_note} Maintain high protein intake. Adjust calories according to {goal}.",
        "example_meals": random.sample(meal_pool, 4),
        "workout_strategy": f"{random.choice(workout_pool)}. {recovery_note}",
        "workout_split": workout_split,
        "explanation": explanation,
        "confidence": round(confidence * 100, 2),
        "model_type": "KNN Classification"
    }