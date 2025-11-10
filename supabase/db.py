# supabase/db.py
from supabase import create_client
import os

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)

def save_message(name, email, message):
    return supabase.table("messages").insert({
        "name": name,
        "email": email,
        "message": message
    }).execute()
