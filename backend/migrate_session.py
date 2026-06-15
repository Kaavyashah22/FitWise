import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")
if DATABASE_URL:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE public.chat_messages ADD COLUMN session_id UUID DEFAULT gen_random_uuid();"))
            conn.commit()
            print("Successfully added session_id column!")
        except Exception as e:
            print(f"Error (maybe already exists?): {e}")
else:
    print("No DATABASE_URL found.")
