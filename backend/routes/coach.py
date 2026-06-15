from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address

from db import get_db
from security import get_current_user
from models import User, ChatSession, ChatMessage
from services.context_builder import build_user_context
from services.ai_service import ai_provider
from services.rag_logs import log_rag_interaction
from typing import List
from datetime import datetime

# Rate limiting (e.g., 20 requests per minute)
limiter = Limiter(key_func=get_remote_address)
router = APIRouter(tags=["Coach"])

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    timestamp: datetime

@router.get("/history", response_model=List[MessageResponse])
def get_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).order_by(ChatSession.created_at.desc()).first()
    if not session:
        return []
        
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session.id).order_by(ChatMessage.timestamp.asc()).all()
    return [{"id": str(m.id), "role": m.role, "content": m.content, "timestamp": m.timestamp} for m in messages]

@router.delete("/history")
def clear_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).order_by(ChatSession.created_at.desc()).first()
    if session:
        # Cascade delete will remove all associated ChatMessages
        db.delete(session)
        db.commit()
    return {"status": "success", "message": "Chat history cleared"}

@router.post("/chat", response_model=ChatResponse)
@limiter.limit("20/minute")
def chat_with_coach(
    request: Request,
    chat_request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Get or create chat session
    session = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).order_by(ChatSession.created_at.desc()).first()
    if not session:
        session = ChatSession(user_id=current_user.id)
        db.add(session)
        db.commit()
        db.refresh(session)
        
    # 2. Save user message
    user_msg = ChatMessage(session_id=session.id, role="user", content=chat_request.message)
    db.add(user_msg)
    db.commit()
    
    # 3. Load history
    history_msgs = db.query(ChatMessage).filter(ChatMessage.session_id == session.id).order_by(ChatMessage.timestamp.desc()).limit(10).all()
    history_msgs.reverse() # We want chronological order
    
    # Exclude the message we just added from history, or pass it all together?
    # Wait, ai_provider.generate appends the new message manually. So exclude the last one.
    history_list = [{"role": m.role, "content": m.content} for m in history_msgs[:-1]]

    # 4. Build Context safely
    context = build_user_context(current_user.id, db)
    
    # 5. Call AI Provider
    try:
        reply = ai_provider.generate(context=context, message=chat_request.message, history=history_list)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Provider Error: {str(e)}")
        
    # 6. Save AI Response
    ai_msg = ChatMessage(session_id=session.id, role="assistant", content=reply)
    db.add(ai_msg)
    db.commit()
        
    # 7. Log Interaction for Future Fine-Tuning (LoRA dataset generation)
    log_rag_interaction(context=context, question=chat_request.message, response=reply)
    
    return ChatResponse(reply=reply)
