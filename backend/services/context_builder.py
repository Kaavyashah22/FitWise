from sqlalchemy.orm import Session
from uuid import UUID
from datetime import date
from models import UserProfile, Workout, WeightLog, WorkoutExercise
from sqlalchemy.orm import joinedload

def build_user_context(user_id: UUID, db: Session) -> str:
    """
    Retrieves live user data from the existing FitWise database layer through SQLAlchemy.
    Never invents missing values. Omits unavailable fields safely.
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    
    context_parts = []
    
    if profile:
        if profile.age:
            context_parts.append(f"Age {profile.age}")
            
        if profile.height_cm:
            context_parts.append(f"Height {profile.height_cm} cm")
            
        if profile.gender:
            context_parts.append(f"Gender {profile.gender}")
            
        if profile.activity_level:
            context_parts.append(f"Activity Level {profile.activity_level}")
            
        if profile.goal:
            context_parts.append(f"Goal {profile.goal}")
            
        if profile.food_preference:
            context_parts.append(f"Food Preference: {profile.food_preference}")
            
        if profile.medical_history:
            context_parts.append(f"Medical History: {profile.medical_history}")

    # Weight Priority Logic
    # 1. Try to fetch the latest weight log
    latest_weight = db.query(WeightLog).filter(WeightLog.user_id == user_id).order_by(WeightLog.date.desc()).first()
    weight_kg = None
    
    if latest_weight:
        weight_kg = latest_weight.weight_kg
    elif profile and profile.weight_kg:
        weight_kg = profile.weight_kg
        
    if weight_kg:
        context_parts.append(f"Weight {weight_kg} kg")
        if profile and profile.height_cm:
            height_m = float(profile.height_cm) / 100
            bmi = float(weight_kg) / (height_m * height_m)
            context_parts.append(f"BMI {bmi:.1f}")

    # Note: Medical History, Calories remaining, and Macro progress are omitted safely 
    # until their respective tables/columns are fully integrated into the DB schema.
    
    latest_workout_date_row = db.query(Workout.date).filter(Workout.user_id == user_id).order_by(Workout.date.desc()).first()
    
    if latest_workout_date_row:
        latest_date = latest_workout_date_row.date
        
        workouts_on_date = db.query(Workout).filter(
            Workout.user_id == user_id,
            Workout.date == latest_date
        ).all()
        
        workout_ids = [w.id for w in workouts_on_date]
        
        exercises = db.query(WorkoutExercise).options(
            joinedload(WorkoutExercise.exercise),
            joinedload(WorkoutExercise.sets)
        ).filter(WorkoutExercise.workout_id.in_(workout_ids)).order_by(WorkoutExercise.created_at).all()
        
        session_parts = []
        for we in exercises:
            if not we.sets:
                session_parts.append(f"{we.exercise.name}")
                continue
            
            num_sets = len(we.sets)
            reps = we.sets[0].reps
            weight = we.sets[0].weight_kg
            # Format requested: Squat (3x8@80kg)
            # Remove '.0' or format weight cleanly if possible, but default string is fine
            # We'll parse float to drop trailing zeros if possible, or just leave as is
            clean_weight = int(weight) if weight == int(weight) else float(weight)
            session_parts.append(f"{we.exercise.name} ({num_sets}x{reps}@{clean_weight}kg)")
            
        if session_parts:
            context_parts.append(f"Last Session on {latest_date}: " + ", ".join(session_parts))
        else:
            # Fallback if no exercises found for those workouts
            workout_names = [w.name for w in workouts_on_date if w.name]
            if workout_names:
                context_parts.append(f"Last Session on {latest_date}: " + ", ".join(workout_names))

    context_string = "Context: " + ", ".join(context_parts) if context_parts else "Context: No specific profile data available."
    print("--- CONTEXT BUILDER LOG ---")
    print(f"Generated Context: {context_string}")
    print("---------------------------")
    return context_string
