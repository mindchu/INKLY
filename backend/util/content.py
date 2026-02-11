from typing import Dict, Any, Optional, List
from obj.post_discussion_comment import Post, Discussion, Comment
from util.dbconn import db
from util import karma

def create_content(content_data: Dict[str, Any], user_id: str, _id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Creates a Post or Discussion based on the 'type' field in content_data.
    """
    content_type = content_data.get('type')
    title = content_data.get('title')
    text = content_data.get('text')
    
    if not title or not text or not content_type:
        return None

    if content_type == 'post':
        content = Post(
            title=title,
            author_id=user_id,
            text=text,
            tags=content_data.get('tags', []),
            _id=_id,
            # Add other optional fields if provided
            file_paths=content_data.get('file_paths', [])
        )
        collection = db.posts
    elif content_type == 'discussion':
        content = Discussion(
            title=title,
            author_id=user_id,
            text=text,
            tags=content_data.get('tags', []),
            _id=_id,
            # Add other optional fields if provided
            file_paths=content_data.get('file_paths', [])
        )
        collection = db.discussions
    else:
        return None
        
    data = content.to_dict(include_secrets=True)
    result = collection.insert_one(data)
    
    if result.inserted_id:
        # Update dynamic tags
        from util import tags
        tags.ensure_tags_exist(content_data.get('tags', []))
        
        # Update user karma
        karma.update_karma_on_create(user_id, content_type)
        
        # Track content ID in user profile
        if content_type == 'post':
            db.users.update_one(
                {"google_id": user_id},
                {"$addToSet": {"uploaded_doc_ids": content.content_id}}
            )
        elif content_type == 'discussion':
            db.users.update_one(
                {"google_id": user_id},
                {"$addToSet": {"discussion_ids": content.content_id}}
            )
        
        # Convert _id to string for JSON serialization
        data['_id'] = str(data['_id'])
        return data
        
    return None

def get_recommended_content(user_id: Optional[str], sort_by: str = 'likes', limit: int = 10, filter_tags: Optional[List[str]] = None, content_type: Optional[str] = None) -> list:
    """
    Fetches content (posts and discussions).
    If filter_tags is provided, it filters by those specific tags.
    Otherwise, if user_id is provided and they have interested_tags, it filters by those tags.
    If content_type is provided ('post' or 'discussion'), it only returns that type.
    Fallbacks to showing all content if no specific filters apply or no matches found.
    """
    # 1. Fetch user interests if user_id is provided
    interested_tags = []
    if not filter_tags and user_id:
        user_doc = db.users.find_one({"google_id": user_id})
        if user_doc:
            interested_tags = user_doc.get('interested_tags', [])

    def fetch_and_format(query):
        posts = []
        discussions = []
        
        if not content_type or content_type == 'post':
            posts = list(db.posts.find(query))
        
        if not content_type or content_type == 'discussion':
            discussions = list(db.discussions.find(query))
        
        all_content = posts + discussions
        for doc in all_content:
            doc['_id'] = str(doc['_id'])
            if 'liked_by_user_ids' not in doc:
                doc['liked_by_user_ids'] = []
            if 'tags' not in doc:
                doc['tags'] = []
            if 'comment_ids' not in doc:
                doc['comment_ids'] = []
            
            # Fetch author username
            author = db.users.find_one({"google_id": doc.get('author_id')}, {"username": 1})
            doc['author_username'] = author.get('username', 'Unknown') if author else 'Unknown'
        return all_content

    # 2. Fetch content
    content = []
    if filter_tags:
        # Use provided tags for filtering
        content = fetch_and_format({"tags": {"$in": filter_tags}})
    elif interested_tags:
        # Fallback to user interests
        content = fetch_and_format({"tags": {"$in": interested_tags}})

    # 3. Fallback to all content if no interests or no content matches filters
    if not content:
        content = fetch_and_format({})

    # Sorting
    if sort_by == 'likes':
        content.sort(key=lambda x: len(x.get('liked_by_user_ids', [])), reverse=True)
    else:
        # Default to newest first
        content.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
    return content[:limit]

def get_content_by_id(content_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetches a post or discussion by its ID.
    """
    # Check posts first
    doc = db.posts.find_one({"_id": content_id})
    if not doc:
        # Check discussions
        doc = db.discussions.find_one({"_id": content_id})
    
    if doc:
        doc['_id'] = str(doc['_id'])
        # Fetch author username
        author = db.users.find_one({"google_id": doc.get('author_id')}, {"username": 1})
        doc['author_username'] = author.get('username', 'Unknown') if author else 'Unknown'
        return doc
    return None

def create_comment(parent_id: str, author_id: str, text: str) -> Optional[Dict[str, Any]]:
    """
    Creates a comment and attaches it to its parent (post, discussion, or comment).
    """
    new_comment = Comment(parent_id=parent_id, author_id=author_id, text=text)
    data = new_comment.to_dict(include_secrets=True)
    
    result = db.comments.insert_one(data)
    if not result.inserted_id:
        return None
        
    data['_id'] = str(data['_id'])
    
    # Update parent's comment/reply list
    # Parent could be a post, discussion, or another comment
    updated = False
    
    # Try updating as a post
    res = db.posts.update_one({"_id": parent_id}, {"$push": {"comment_ids": data['_id']}})
    if res.modified_count > 0:
        updated = True
    
    if not updated:
        # Try updating as a discussion
        res = db.discussions.update_one({"_id": parent_id}, {"$push": {"comment_ids": data['_id']}})
        if res.modified_count > 0:
            updated = True
            
    if not updated:
        # Try updating as a comment (reply)
        res = db.comments.update_one({"_id": parent_id}, {"$push": {"reply_ids": data['_id']}})
        if res.modified_count > 0:
            updated = True
            
    # Update user karma for comment creation
    karma.update_karma_on_create(author_id, "comment")
    
    # Fetch author username for the new comment
    author = db.users.find_one({"google_id": author_id}, {"username": 1})
    data['author_username'] = author.get('username', 'Unknown') if author else 'Unknown'
            
    return data

def get_comment_tree(parent_id: str) -> List[Dict[str, Any]]:
    """
    Recursively builds a tree of comments starting from a parent ID.
    Fetches children based on IDs listed in the parent's comment_ids or reply_ids.
    """
    # 1. Fetch the parent document to get children list
    parent = db.posts.find_one({"_id": parent_id})
    if not parent:
        parent = db.discussions.find_one({"_id": parent_id})
    if not parent:
        parent = db.comments.find_one({"_id": parent_id})
        
    if not parent:
        return []
        
    child_ids = parent.get('comment_ids') or parent.get('reply_ids') or []
    if not child_ids:
        return []
        
    # 2. Fetch all direct child comments
    cursor = db.comments.find({"_id": {"$in": child_ids}})
    comments = []
    
    for doc in cursor:
        doc['_id'] = str(doc['_id'])
        # Recursive call to get replies
        doc['replies'] = get_comment_tree(doc['_id'])
        
        if 'liked_by_user_ids' not in doc:
            doc['liked_by_user_ids'] = []
            
        # Fetch author username
        author = db.users.find_one({"google_id": doc.get('author_id')}, {"username": 1})
        doc['author_username'] = author.get('username', 'Unknown') if author else 'Unknown'
            
        comments.append(doc)
        
    # Sort comments by creation time
    comments.sort(key=lambda x: x.get('created_at', ''), reverse=False)
    
    return comments

def toggle_like(content_id: str, user_id: str) -> Optional[bool]:
    """
    Toggles a like for a post, discussion, or comment.
    Returns True if liked, False if unliked, None if content not found.
    """
    # Try posts
    doc = db.posts.find_one({"_id": content_id})
    collection = db.posts
    
    if not doc:
        # Try discussions
        doc = db.discussions.find_one({"_id": content_id})
        collection = db.discussions
        
    if not doc:
        # Try comments
        doc = db.comments.find_one({"_id": content_id})
        collection = db.comments
        
    if not doc:
        return None
        
    liked_by = doc.get('liked_by_user_ids', [])
    if user_id in liked_by:
        # Unlike
        collection.update_one({"_id": content_id}, {"$pull": {"liked_by_user_ids": user_id}})
        return False
    else:
        # Like
        collection.update_one({"_id": content_id}, {"$addToSet": {"liked_by_user_ids": user_id}})
        return True

def delete_content(content_id: str, user_id: str) -> bool:
    """
    Deletes a post or discussion and reverses the karma gain.
    Only the author can delete their own content.
    
    Args:
        content_id: The ID of the content to delete
        user_id: The google_id of the user attempting deletion
    
    Returns:
        True if deleted successfully, False otherwise
    """
    # Try to find in posts first
    doc = db.posts.find_one({"_id": content_id})
    collection = db.posts
    content_type = "post"
    
    if not doc:
        # Try discussions
        doc = db.discussions.find_one({"_id": content_id})
        collection = db.discussions
        content_type = "discussion"
    
    if not doc:
        return False
    
    # Check if user is the author
    if doc.get('author_id') != user_id:
        return False
    
    # Delete all associated comments recursively
    comment_ids = doc.get('comment_ids', [])
    for comment_id in comment_ids:
        _delete_comment_recursive(comment_id)
    
    # Delete the content
    result = collection.delete_one({"_id": content_id})
    
    if result.deleted_count > 0:
        # Remove content ID from user profile
        if content_type == 'post':
            db.users.update_one(
                {"google_id": user_id},
                {"$pull": {"uploaded_doc_ids": content_id}}
            )
        elif content_type == 'discussion':
            db.users.update_one(
                {"google_id": user_id},
                {"$pull": {"discussion_ids": content_id}}
            )
        
        # Reverse the karma gain
        karma.update_karma_on_delete(user_id, content_type)
        return True
    
    return False

def delete_comment(comment_id: str, user_id: str) -> bool:
    """
    Deletes a comment and reverses the karma gain.
    Only the author can delete their own comment.
    Also removes the comment from its parent's list.
    
    Args:
        comment_id: The ID of the comment to delete
        user_id: The google_id of the user attempting deletion
    
    Returns:
        True if deleted successfully, False otherwise
    """
    # Find the comment
    comment = db.comments.find_one({"_id": comment_id})
    
    if not comment:
        return False
    
    # Check if user is the author
    if comment.get('author_id') != user_id:
        return False
    
    parent_id = comment.get('parent_id')
    
    # Delete all replies recursively
    reply_ids = comment.get('reply_ids', [])
    for reply_id in reply_ids:
        _delete_comment_recursive(reply_id)
    
    # Delete the comment
    result = db.comments.delete_one({"_id": comment_id})
    
    if result.deleted_count > 0:
        # Remove from parent's list
        db.posts.update_one({"_id": parent_id}, {"$pull": {"comment_ids": comment_id}})
        db.discussions.update_one({"_id": parent_id}, {"$pull": {"comment_ids": comment_id}})
        db.comments.update_one({"_id": parent_id}, {"$pull": {"reply_ids": comment_id}})
        
        # Reverse the karma gain
        karma.update_karma_on_delete(user_id, "comment")
        return True
    
    return False

def _delete_comment_recursive(comment_id: str) -> None:
    """
    Recursively deletes a comment and all its replies, updating karma for each.
    This is a helper function used when deleting parent content.
    
    Args:
        comment_id: The ID of the comment to delete
    """
    comment = db.comments.find_one({"_id": comment_id})
    
    if not comment:
        return
    
    # Delete all replies first
    reply_ids = comment.get('reply_ids', [])
    for reply_id in reply_ids:
        _delete_comment_recursive(reply_id)
    
    # Delete this comment and reverse karma
    author_id = comment.get('author_id')
    db.comments.delete_one({"_id": comment_id})
    
    if author_id:
        karma.update_karma_on_delete(author_id, "comment")
