from typing import Optional
from util.dbconn import db

# Karma point values for different content types
KARMA_VALUES = {
    "post": 5,           # Creating a post gives +5 post_karma
    "discussion": 3,     # Creating a discussion gives +3 discussion_karma
    "comment": 1         # Creating a comment gives +1 discussion_karma
}

def update_karma_on_create(user_id: str, content_type: str) -> bool:
    """
    Increases user karma when content is created.
    
    Args:
        user_id: The google_id of the user
        content_type: Type of content ('post', 'discussion', or 'comment')
    
    Returns:
        True if karma was updated successfully, False otherwise
    """
    if content_type not in KARMA_VALUES:
        return False
    
    karma_amount = KARMA_VALUES[content_type]
    
    # Determine which karma field to update
    if content_type == "post":
        karma_field = "post_karma"
    elif content_type == "discussion":
        karma_field = "discussion_karma"
    else: # comment
        karma_field = "comment_karma"
    
    # Atomically increment the karma
    result = db.users.update_one(
        {"google_id": user_id},
        {"$inc": {karma_field: karma_amount}}
    )
    
    return result.modified_count > 0 or result.matched_count > 0

def update_karma_on_delete(user_id: str, content_type: str) -> bool:
    """
    Decreases user karma when content is deleted.
    
    Args:
        user_id: The google_id of the user
        content_type: Type of content ('post', 'discussion', or 'comment')
    
    Returns:
        True if karma was updated successfully, False otherwise
    """
    if content_type not in KARMA_VALUES:
        return False
    
    karma_amount = -KARMA_VALUES[content_type]  # Negative to subtract
    
    # Determine which karma field to update
    if content_type == "post":
        karma_field = "post_karma"
    elif content_type == "discussion":  # discussion 
        karma_field = "discussion_karma"
    else:
        karma_field = "comment_karma"    
    # Atomically decrement the karma
    result = db.users.update_one(
        {"google_id": user_id},
        {"$inc": {karma_field: karma_amount}}
    )
    
    return result.modified_count > 0 or result.matched_count > 0

def get_user_karma(user_id: str) -> Optional[dict]:
    """
    Retrieves the current karma values for a user.
    
    Args:
        user_id: The google_id of the user
    
    Returns:
        Dictionary with post_karma and discussion_karma, or None if user not found
    """
    user = db.users.find_one(
        {"google_id": user_id},
        {"post_karma": 1, "discussion_karma": 1, "_id": 0}
    )
    
    return user if user else None
