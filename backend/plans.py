import random

MEDICAL_RULES = {
    "diabetes": {
        "diet": [
            " Focus on low glycemic index foods to maintain stable blood sugar levels.",
            " Prioritize slow-digesting carbohydrates and avoid sugar spikes.",
            " Emphasize complex carbs and fiber-rich foods to regulate glucose levels."
        ],
        "meals": ["Oats", "Quinoa", "Lentils", "Paneer", "Leafy vegetables", "Chickpeas", "Brown rice", "Vegetable soups"],
        "workout_sed": [
            "Start gradually with light daily walks to improve insulin sensitivity.",
            "Begin with gentle movement spread throughout the day to support glucose control.",
            "Incorporate brief, light activity sessions to help manage blood sugar."
        ],
        "workout_act": [
            "Maintain consistent moderate exercise to improve insulin sensitivity.",
            "Keep up steady, moderate-intensity workouts for glucose control.",
            "Engage in regular cardiovascular and moderate resistance training."
        ],
        "workout_suffix": " Focus on consistency and moderate effort. Avoid high intensity.",
        "workout_prefix": "",
        "advice": ["Avoid high sugar foods and refined carbs", "Monitor blood glucose regularly", "Prefer smaller frequent meals"],
        "split": [
            "Day 1: Full Body (Moderate Intensity) + Walking",
            "Day 2: Light Cardio (Cycling/Walking)",
            "Day 3: Upper Body Strength (Controlled)",
            "Day 4: Rest / Mobility",
            "Day 5: Lower Body + Core (Moderate)"
        ]
    },
    "hypertension": {
        "diet": [
            " Maintain a low sodium diet, avoid processed and packaged foods.",
            " Focus on reducing salt intake and prioritizing fresh whole foods.",
            " Incorporate DASH diet principles, emphasizing vegetables and low-fat dairy."
        ],
        "meals": ["Fruits", "Vegetables", "Whole grains", "Low-fat dairy", "Unsalted nuts", "Fish", "Beans"],
        "workout_sed": [
            " Begin with light walking to safely increase heart rate.",
            " Start gradually with gentle cardiovascular exercises.",
            " Incorporate short, low-intensity walks daily."
        ],
        "workout_act": [
            " Maintain moderate cardio like walking or cycling.",
            " Keep up consistent aerobic exercise for heart health.",
            " Engage in moderate to high intensity cardiovascular training."
        ],
        "workout_suffix": "",
        "workout_prefix": "",
        "advice": ["Limit salt intake", "Avoid high-stress training", "Stay hydrated"],
        "split": None
    },
    "joint": {
        "diet": [
            " Incorporate anti-inflammatory foods like nuts, seeds, and leafy greens.",
            " Focus on foods rich in Omega-3 to support joint health.",
            " Emphasize an anti-inflammatory diet strategy."
        ],
        "meals": [],
        "workout_sed": [
            " Start gradually with gentle low-impact movements (stretching, light resistance).",
            " Begin with restorative mobility work and very low-impact exercises.",
            " Incorporate daily stretching and light pool exercises if possible."
        ],
        "workout_act": [
            " Prioritize low-impact training (cycling, swimming, machine workouts) to protect joints.",
            " Swap high-impact exercises for joint-friendly alternatives.",
            " Maintain moderate to high intensity using low-impact modalities."
        ],
        "workout_suffix": "",
        "workout_prefix": " ",
        "advice": ["Avoid heavy squats/deadlifts if painful", "Warm up properly", "Focus on mobility and flexibility"],
        "split": [
            "Day 1: Machine Upper Body",
            "Day 2: Cycling",
            "Day 3: Resistance Bands",
            "Day 4: Swimming / Low Impact Cardio",
            "Day 5: Mobility + Stretching"
        ]
    },
    "asthma": {
        "diet": [
            " Incorporate foods rich in antioxidants to support respiratory health.",
            " Emphasize antioxidant-rich fruits and vegetables.",
            " Maintain a balanced diet rich in vitamins to support immune function."
        ],
        "meals": [],
        "workout_sed": [
            " Start gradually with very light pace workouts, focusing on breathing control.",
            " Begin with gentle exercises in controlled environments.",
            " Incorporate light steady-state activities with focused breathing."
        ],
        "workout_act": [
            " Maintain moderate pace workouts, avoiding sudden high-intensity bursts.",
            " Steady-state cardiovascular exercise is preferred over extreme HIIT.",
            " Keep up moderate intensity but manage rest periods carefully."
        ],
        "workout_suffix": "",
        "workout_prefix": "",
        "advice": ["Always carry inhaler if prescribed", "Avoid cold/dry air workouts", "Include proper warm-up"],
        "split": [
            "Day 1: Light Cardio + Breathing Exercises",
            "Day 2: Yoga / Mobility",
            "Day 3: Upper Body (Moderate Intensity)",
            "Day 4: Walking / Cycling",
            "Day 5: Rest or Stretching"
        ]
    },
    "thyroid": {
        "diet": [
            " Focus on a balanced diet supporting overall metabolism.",
            " Ensure adequate caloric intake to prevent metabolic slowdown.",
            " Emphasize whole foods that support thyroid function and energy levels."
        ],
        "meals": ["Whole grains", "Nuts", "Seeds", "Vegetables", "Lean proteins", "Eggs", "Yogurt"],
        "workout_sed": [
            " Start gradually with consistent light activity to boost metabolism.",
            " Begin with daily moderate movement to improve energy levels.",
            " Incorporate frequent light walks to support metabolic health."
        ],
        "workout_act": [
            " Maintain consistent strength + cardio training to support metabolism.",
            " Keep up regular varied workouts focusing on muscle maintenance.",
            " Engage in moderate to high intensity workouts to stimulate energy balance."
        ],
        "workout_suffix": "",
        "workout_prefix": "",
        "advice": ["Maintain regular eating schedule", "Avoid extreme calorie restriction", "Monitor energy levels"],
        "split": None
    }
}


def apply_medical_adjustments(plan: dict, medical_history: str, activity: str = "Active") -> dict:
    if not medical_history or medical_history.lower() == "none":
        return plan

    plan = plan.copy()
    cond = medical_history.lower()
    advice = []
    is_sedentary = activity.lower() == "sedentary"

    for key, rules in MEDICAL_RULES.items():
        if key in cond:
            plan["diet_strategy"] += random.choice(rules["diet"])
            
            if rules["meals"] and isinstance(plan.get("example_meals"), list):
                plan["example_meals"].extend(random.sample(rules["meals"], k=min(3, len(rules["meals"]))))
                
            workout_var = random.choice(rules["workout_sed"] if is_sedentary else rules["workout_act"])
            if rules["workout_prefix"]:
                plan["workout_strategy"] = workout_var.strip() + rules["workout_prefix"] + plan["workout_strategy"]
            else:
                plan["workout_strategy"] = workout_var + rules["workout_suffix"] if key == "diabetes" else plan["workout_strategy"] + workout_var
                
            advice.extend(rules["advice"])
            
            if rules["split"]:
                plan["workout_split"] = rules["split"]

    if advice:
        unique_advice = []
        for a in advice:
            if a not in unique_advice:
                unique_advice.append(a)
        plan["medical_advice"] = unique_advice
        
        explanation_variants = [
            f" Plan adjusted considering {medical_history} to ensure safety and effectiveness.",
            f" Recommendations adapted based on {medical_history} for better health outcomes.",
            f" This plan includes adjustments for {medical_history} to improve safety and performance."
        ]
        plan["explanation"] += random.choice(explanation_variants)

    if isinstance(plan.get("example_meals"), list):
        unique_meals = list(dict.fromkeys(plan["example_meals"]))
        plan["example_meals"] = unique_meals[:6]

    return plan


def generate_plan(plan_key, age, bmi, activity, goal, confidence, food_type, medical_history="None"):

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
    plan = {
        "title": f"{base_title} (AI Personalized)",
        "diet_strategy": f"{intensity_note} Maintain high protein intake. Adjust calories according to {goal}.",
        "example_meals": random.sample(meal_pool, 4),
        "workout_strategy": f"{random.choice(workout_pool)}. {recovery_note}",
        "workout_split": workout_split,
        "explanation": explanation,
        "confidence": round(confidence * 100, 2),
        "model_type": "KNN Classification"
    }
    
    return apply_medical_adjustments(plan, medical_history, activity)