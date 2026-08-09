import json
import random

# 1. EXACT FITWISE DB OPTIONS & ENUMS
ACTIVITY_LEVELS = ["sedentary", "light", "moderate", "active", "very_active"]
GOALS = ["lose_weight", "maintain", "gain_muscle"]
FOOD_PREFERENCES = ["Veg", "Non-Veg", "Vegan"]
MEDICAL_HISTORIES = ["None", "Diabetes", "Hypertension", "Asthma", "Thyroid Disorder", "Joint Issues"]
GENDERS = ["Male", "Female", "Other"]

# 2. SIMULATED RAG WORKOUT RECORDS
PAST_WORKOUTS = [
    "Last Session on 2026-05-27: Squats (3x8@80kg), Leg Press (3x10@120kg), Calf Raises (4x15@60kg)",
    "Last Session on 2026-05-26: Bench Press (3x10@60kg), Incline Dumbbell Press (3x10@22kg), Tricep Pushdowns (3x12@15kg)",
    "Last Session on 2026-05-25: Lat Pulldowns (3x10@50kg), Seated Cable Rows (3x12@45kg), Bicep Curls (3x15@10kg)",
    "Last Session on 2026-05-24: Rest Day (No movements logged)"
]

SYSTEM_PROMPT = """You are FitWise Coach, an authoritative and personalized fitness assistant.
CRITICAL RULES:
1. TONE & PERSONA: Adopt a concise, structured, and authoritative tone. Prioritize actionable guidance over motivational filler.
2. MANDATORY CONTEXT: You receive real-time user data and workout history. You MUST automatically reference and adapt to this context. NEVER ask for information already provided.
3. FORMATTING: Use bullet points, concise sections, and bolded workout blocks.
4. SAFETY: Prioritize safety constraints over workout intensity."""

USER_PROMPTS = [
    "I just finished my workout. How does the volume look, and what muscle group should I focus on tomorrow?",
    "What should I eat for dinner tonight to hit my targets?",
    "Can you give me a workout plan for tomorrow?",
    "How should I adjust my cardio routine?",
    "What's a good high protein breakfast option?"
]

def generate_assistant_response(context_data: dict) -> str:
    goal = context_data['goal']
    med = context_data['medical_history']
    food = context_data['food_preference']
    workout = context_data['workout']
    weight = context_data['weight']
    user_prompt = context_data['user_prompt']
    
    # DYNAMIC MACRO MATH BASED ON WEIGHT & GOAL
    if goal == "lose_weight":
        target_calories = int(weight * 24)
        protein_min = int(weight * 1.8)
        protein_max = int(weight * 2.2)
        goal_str = "fat-loss (cut)"
    elif goal == "gain_muscle":
        target_calories = int(weight * 34)
        protein_min = int(weight * 2.0)
        protein_max = int(weight * 2.4)
        goal_str = "hypertrophy (bulk)"
    else:
        target_calories = int(weight * 29)
        protein_min = int(weight * 1.6)
        protein_max = int(weight * 2.0)
        goal_str = "maintenance"

    response = ""
    
    # --- WORKOUT REVIEW & VOLUME ANALYSIS ---
    if "volume" in user_prompt or "workout" in user_prompt or "plan" in user_prompt:
        response += "### Target Training Protocol\n"
        
        if "Rest Day" in workout:
            response += "Your last recorded day was a Rest Day. Your systemic fatigue is low, meaning your body is fully primed for high-intensity training.\n\n"
        else:
            response += f"Reviewing your previous session data ({workout.split(': ')[1] if ': ' in workout else workout}). Your volume looks optimal for your **{goal_str}** phase, targeting compound movements effectively.\n\n"
            
        if med == "Asthma":
            response += "**Safety Constraint (Asthma):** Maintain strict rest periods of 90-120 seconds. Keep a rescue inhaler nearby. Avoid high-intensity interval training (HIIT).\n"
        elif med == "Joint Issues":
            response += "**Safety Constraint (Joint Issues):** Avoid high-impact plyometrics and heavy free-weight axial loading. Stick to closed-kinetic machine lines with controlled eccentrics.\n"
        elif med == "Hypertension":
            response += "**Safety Constraint (Hypertension):** Breathe continuously during heavy contractions; do NOT perform the Valsalva maneuver to safeguard your vascular pressure.\n"
            
        if "Squats" in workout:
            response += "\n**Tomorrow's Focus:** Upper Body (Push/Pull) to allow full recovery of your lower body anterior chain.\n"
            response += "**Movements:**\n- Incline Dumbbell Press (3x10)\n- Seated Cable Rows (3x12)\n- Lateral Raises (3x15)"
        elif "Bench" in workout or "Push" in workout:
            response += "\n**Tomorrow's Focus:** Posterior Chain / Lower Body or Pull Day to prevent overloading your chest and shoulders.\n"
            response += "**Movements:**\n- Romanian Deadlifts (3x8)\n- Lat Pulldowns (3x10)\n- Lying Hamstring Curls (3x12)"
        else:
            response += "\n**Movements:**\n- Barbell Back Squats (3x8)\n- Overhead Press (3x10)\n- Pull-ups (3xMax)"

    # --- NUTRITION LOGIC ---
    elif "eat" in user_prompt or "dinner" in user_prompt or "breakfast" in user_prompt:
        response += "### Target Nutrition Protocol\n"
        response += f"To support your **{goal_str}** goals at your current weight of **{weight} kg**, aim for approximately **{target_calories} kcal** and **{protein_min}g–{protein_max}g of protein** daily.\n\n"
        
        if med == "Diabetes":
            response += "**Safety Constraint (Diabetes):** Prioritize complex, low-glycemic carbohydrates. Pair all intake with dense protein to stabilize insulin response.\n"
        elif med == "Hypertension":
            response += "**Safety Constraint (Hypertension):** Restrict sodium intake to under 500mg for this meal. Rely on potassium-rich foods and green herbs.\n"
            
        if food == "Vegan":
            response += "Using a **Vegan** framework:\n- **Sources:** Tempeh, extra-firm tofu, seitan crumbles, or pea protein isolates.\n"
        elif food == "Veg":
            response += "Using a **Vegetarian** framework:\n- **Sources:** Low-fat paneer, egg whites, non-fat plain Greek yogurt, or whey isolate.\n"
        else:
            response += "Using a standard nutritional framework:\n- **Sources:** Skinless chicken breast, wild-caught white fish, turkey breast, or egg whites.\n"
            
        response += "- **Execution:** Complete with 2 cups of fibrous green vegetables and complex carb macro pacing."

    # --- CARDIO LOGIC ---
    elif "cardio" in user_prompt:
        response += "### Target Cardiovascular Protocol\n"
        if med == "Asthma":
            response += "Cardio strategy adjusted for Asthma: Implement Low-Intensity Steady State (LISS) cardio exclusively. Perform 20-30 minutes of steady incline walking at a conversational pace. Avoid HIIT.\n"
        elif med == "Joint Issues":
            response += "Cardio strategy adjusted for Joint Issues: Utilize zero-impact patterns. 30 minutes on a recumbent stationary cycle or swimming to minimize joint shear stress.\n"
        else:
            response += f"Cardio tailored to **{goal_str}**: Implement 30 minutes of moderate-intensity steady-state cardio 3x per week to drive fat oxidation.\n"
    else:
        response += f"Protocol Acknowledged. Target Daily Energy: {target_calories} kcal | Protein Target: {protein_min}g-{protein_max}g. Maintain current baseline tracking and progressive overload consistency."
        
    return response

def generate():
    dataset = []
    for _ in range(300):
        age = random.randint(18, 60)
        weight = random.randint(50, 120)
        height = random.randint(150, 200)
        gender = random.choice(GENDERS)
        activity = random.choice(ACTIVITY_LEVELS)
        goal = random.choice(GOALS)
        food = random.choice(FOOD_PREFERENCES)
        med = random.choice(MEDICAL_HISTORIES)
        workout = random.choice(PAST_WORKOUTS)
        user_prompt = random.choice(USER_PROMPTS)
        
        context_str = f"[LIVE DATABASE CONTEXT]\nContext: Age {age}, Height {height} cm, Gender {gender}, Activity Level {activity}, Goal {goal}, Food Preference: {food}, Medical History: {med}, Weight {weight} kg.\n{workout}"
        system_content = f"{SYSTEM_PROMPT}\n\n{context_str}"
        
        context_data = {
            "goal": goal, 
            "medical_history": med, 
            "food_preference": food, 
            "workout": workout, 
            "weight": weight,
            "user_prompt": user_prompt
        }
        assistant_content = generate_assistant_response(context_data)
        
        dataset.append({
            "messages": [
                {"role": "system", "content": system_content},
                {"role": "user", "content": user_prompt},
                {"role": "assistant", "content": assistant_content}
            ]
        })
        
    output_path = 'fitwise_training_data.jsonl'
    with open(output_path, 'w') as f:
        for row in dataset:
            f.write(json.dumps(row) + "\n")

if __name__ == '__main__':
    generate()
    print("Successfully generated 300 production-exact, macro-calculating rows in fitwise_training_data.jsonl")