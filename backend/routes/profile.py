from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db import get_db
from models import User, UserProfile
from schemas.profile import ProfileUpdate, ProfileResponse
from security import get_current_user

router = APIRouter()

@router.get("/", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        # User requested: Return 200 with empty object for cleaner frontend handling
        return {}
        
    profile_dict = {
        "age": profile.age,
        "height_cm": float(profile.height_cm) if profile.height_cm else None,
        "weight_kg": float(profile.weight_kg) if profile.weight_kg else None,
        "gender": profile.gender,
        "activity_level": profile.activity_level,
        "food_preference": profile.food_preference,
        "medical_history": profile.medical_history,
        "date_of_birth": profile.date_of_birth,
        "user_id": profile.user_id,
        "created_at": profile.created_at,
        "updated_at": profile.updated_at,
    }
    
    if profile.goal == "lose_weight":
        profile_dict["goal"] = "cut"
    elif profile.goal == "gain_muscle":
        profile_dict["goal"] = "bulk"
    else:
        profile_dict["goal"] = profile.goal
        
    return profile_dict

@router.post("/", response_model=ProfileResponse)
def upsert_profile(payload: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    print(f"--- PROFILE POST LOG ---")
    print(f"Incoming payload: {payload.model_dump()}")
    
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        
    dumped = payload.model_dump(exclude_unset=True)
    if "goal" in dumped:
        if dumped["goal"] == "cut":
            dumped["goal"] = "lose_weight"
        elif dumped["goal"] == "bulk":
            dumped["goal"] = "gain_muscle"

    for key, value in dumped.items():
        setattr(profile, key, value)
        
    db.commit()
    db.refresh(profile)
    print(f"Saved to DB - Food Pref: {profile.food_preference}, Medical: {profile.medical_history}")
    print("------------------------")
    
    profile_dict = {
        "age": profile.age,
        "height_cm": float(profile.height_cm) if profile.height_cm else None,
        "weight_kg": float(profile.weight_kg) if profile.weight_kg else None,
        "gender": profile.gender,
        "activity_level": profile.activity_level,
        "food_preference": profile.food_preference,
        "medical_history": profile.medical_history,
        "date_of_birth": profile.date_of_birth,
        "user_id": profile.user_id,
        "created_at": profile.created_at,
        "updated_at": profile.updated_at,
    }
    
    if profile.goal == "lose_weight":
        profile_dict["goal"] = "cut"
    elif profile.goal == "gain_muscle":
        profile_dict["goal"] = "bulk"
    else:
        profile_dict["goal"] = profile.goal
        
    return profile_dict
