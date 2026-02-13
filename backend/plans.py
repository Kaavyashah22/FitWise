import random


def generate_plan(plan_key, age, bmi, activity, goal, confidence, food_type):

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
    # Goal-based meal pools with food preference
    # ------------------------

    if goal == "cut":

        if food_type == "veg":
            meal_pool = [
                "Paneer salad with olive oil",
                "Greek yogurt with chia seeds",
                "Lentil soup with vegetables",
                "Tofu stir fry",
                "Cottage cheese with almonds",
                "Vegetable quinoa bowl"
            ]

        elif food_type == "vegan":
            meal_pool = [
                "Tofu scramble with spinach",
                "Chickpea salad",
                "Vegan protein smoothie",
                "Lentil quinoa bowl",
                "Roasted vegetables with hummus",
                "Vegan tofu curry"
            ]

        else:  # nonveg
            meal_pool = [
                "Grilled chicken salad",
                "Egg whites with spinach",
                "Baked salmon with broccoli",
                "Lean turkey lettuce wraps",
                "Protein smoothie (low carb)",
                "Turkey breast with greens"
            ]

    elif goal == "bulk":

        if food_type == "veg":
            meal_pool = [
                "Paneer rice bowl",
                "Oats with peanut butter and banana",
                "Cheese omelette with toast",
                "Greek yogurt with granola",
                "Dal with brown rice",
                "Vegetable pasta with cheese"
            ]

        elif food_type == "vegan":
            meal_pool = [
                "Vegan protein smoothie with oats",
                "Chickpea curry with rice",
                "Tofu stir fry with noodles",
                "Peanut butter banana sandwich",
                "Vegan lentil pasta",
                "Quinoa black bean bowl"
            ]

        else:  # nonveg
            meal_pool = [
                "Chicken rice bowl with avocado",
                "Steak with sweet potatoes",
                "Whole egg omelette with toast",
                "Salmon with quinoa",
                "Protein shake with oats and milk",
                "Lean beef with rice"
            ]

    else:  # maintain

        if food_type == "veg":
            meal_pool = [
                "Balanced paneer plate with rice",
                "Omelette with whole grain toast",
                "Vegetable tofu stir fry",
                "Yogurt with nuts",
                "Dal with roti",
                "Vegetable quinoa salad"
            ]

        elif food_type == "vegan":
            meal_pool = [
                "Tofu vegetable bowl",
                "Vegan smoothie with almond milk",
                "Chickpea salad wrap",
                "Lentil soup",
                "Roasted vegetables with hummus",
                "Quinoa black bean salad"
            ]

        else:  # nonveg
            meal_pool = [
                "Balanced chicken plate with rice",
                "Fish tacos with beans",
                "Lean beef with brown rice",
                "Grilled salmon with vegetables",
                "Chicken sandwich on whole grain",
                "Egg and avocado toast"
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