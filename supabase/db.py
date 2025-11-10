# from supabase import Client, create_client
# import os

# url: str = os.environ.get("SUPABASE_URL")
# key: str = os.environ.get("SUPABASE_KEY")

# supabase: Client = create_client(url, key)

# def save_message(name, email, message):
#     return supabase.table("messages").insert({
#         "name": name,
#         "email": email,
#         "message": message
#     }).execute()
