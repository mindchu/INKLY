from util.dbconn import db

def is_user_admin(user_id: str) -> bool:
    """Check if the user with the given google_id is in the admins collection."""
    admin_doc = db.admins.find_one({"google_id": user_id})
    return admin_doc is not None
