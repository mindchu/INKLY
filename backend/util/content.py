from typing import Dict, Any, Optional, List
from obj.post_discussion_comment import Post, Discussion, Comment
from util.dbconn import db
from util import karma, embeddings

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
    
    # Generate title embedding for semantic search
    data['title_embedding'] = embeddings.embedding_manager.generate_embedding(title)
    
    result = collection.insert_one(data)
    
    if result.inserted_id:
        # Update dynamic tags
        from util import tags
        tags.ensure_tags_exist(content_data.get('tags', []), created_by=user_id)
        
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
    # 1. Fetch user interests and following if user_id is provided
    interested_tags = []
    following_ids = []
    if not filter_tags and user_id:
        user_doc = db.users.find_one({"google_id": user_id})
        if user_doc:
            interested_tags = user_doc.get('interested_tags', [])
            following_ids = user_doc.get('following_ids', [])

    def fetch_and_format(query):
        posts = []
        discussions = []
        
        if not content_type or content_type == 'post':
            posts = list(db.posts.find(query))
            for p in posts: p['type'] = 'post'
        
        if not content_type or content_type == 'discussion':
            discussions = list(db.discussions.find(query))
            for d in discussions: d['type'] = 'discussion'
        
        user_bookmarks = []
        user_following = []
        if user_id:
            user_doc = db.users.find_one({"google_id": user_id}, {"bookmark_ids": 1, "following_ids": 1})
            if user_doc:
                user_bookmarks = user_doc.get('bookmark_ids', [])
                user_following = user_doc.get('following_ids', [])

        all_content = posts + discussions
        for doc in all_content:
            doc['_id'] = str(doc['_id'])
            liked_by = doc.get('liked_by_user_ids', [])
            comment_ids = doc.get('comment_ids', [])
            
            doc['likes_count'] = len(liked_by)
            doc['comments_count'] = len(comment_ids)
            doc['is_liked'] = user_id in liked_by if user_id else False
            doc['is_bookmarked'] = str(doc['_id']) in user_bookmarks if user_id else False
            doc['is_following'] = doc.get('author_id') in user_following if user_id else False
            
            if 'tags' not in doc:
                doc['tags'] = []
            
            # Fetch author username and profile picture
            author = db.users.find_one({"google_id": doc.get('author_id')}, {"username": 1, "profile_picture_url": 1})
            doc['author_username'] = author.get('username', 'Unknown') if author else 'Unknown'
            doc['author_profile_picture_url'] = author.get('profile_picture_url') if author else None
        return all_content

    # 2. Fetch content
    content = []
    if filter_tags:
        # Use provided tags for filtering
        content = fetch_and_format({"tags": {"$in": filter_tags}})
    elif interested_tags or following_ids:
        # Fallback to user interests and following
        query = {"$or": []}
        if interested_tags:
            query["$or"].append({"tags": {"$in": interested_tags}})
        if following_ids:
            query["$or"].append({"author_id": {"$in": following_ids}})
        content = fetch_and_format(query)

    # 3. Fallback to all content if no interests or no content matches filters
    if not content:
        content = fetch_and_format({})

    # Sorting
    if sort_by == 'likes':
        content.sort(key=lambda x: x.get('likes_count', 0), reverse=True)
    elif sort_by == 'views':
        content.sort(key=lambda x: x.get('views', 0), reverse=True)
    else: # recent
        content.sort(key=lambda x: x.get('created_at', ''), reverse=True)

    return content[:limit]


def get_content_by_id(content_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Fetches a post or discussion by its ID and increments views.
    """
    # 1. Update views
    db.posts.update_one({"_id": content_id}, {"$inc": {"views": 1}})
    db.discussions.update_one({"_id": content_id}, {"$inc": {"views": 1}})

    # 2. Fetch doc
    doc = db.posts.find_one({"_id": content_id})
    if not doc:
        doc = db.discussions.find_one({"_id": content_id})
    
    if doc:
        doc['_id'] = str(doc['_id'])
        liked_by = doc.get('liked_by_user_ids', [])
        comment_ids = doc.get('comment_ids', [])
        
        doc['likes_count'] = len(liked_by)
        doc['comments_count'] = len(comment_ids)
        doc['is_liked'] = user_id in liked_by if user_id else False
        
        if user_id:
            user_doc = db.users.find_one({"google_id": user_id}, {"bookmark_ids": 1, "following_ids": 1})
            doc['is_bookmarked'] = str(doc['_id']) in user_doc.get('bookmark_ids', []) if user_doc else False
            doc['is_following'] = doc.get('author_id') in user_doc.get('following_ids', []) if user_doc else False
        else:
            doc['is_bookmarked'] = False
            doc['is_following'] = False

        # Fetch author username and profile picture
        author = db.users.find_one({"google_id": doc.get('author_id')}, {"username": 1, "profile_picture_url": 1})
        doc['author_username'] = author.get('username', 'Unknown') if author else 'Unknown'
        doc['author_profile_picture_url'] = author.get('profile_picture_url') if author else None
        return doc
    return None

def get_user_bookmarks(user_id: str) -> List[Dict[str, Any]]:
    """
    Fetches all content bookmarked by the user.
    """
    user_doc = db.users.find_one({"google_id": user_id}, {"bookmark_ids": 1, "following_ids": 1})
    if not user_doc:
        return []
        
    bookmark_ids = user_doc.get('bookmark_ids', [])
    if not bookmark_ids:
        return []
        
    # Reuse recommended logic or separate fetch
    posts = list(db.posts.find({"_id": {"$in": bookmark_ids}}))
    discussions = list(db.discussions.find({"_id": {"$in": bookmark_ids}}))
    
    all_content = posts + discussions
    for doc in all_content:
        doc['_id'] = str(doc['_id'])
        liked_by = doc.get('liked_by_user_ids', [])
        doc['likes_count'] = len(liked_by)
        doc['comments_count'] = len(doc.get('comment_ids', []))
        doc['is_liked'] = user_id in liked_by
        doc['is_bookmarked'] = True
        doc['is_following'] = doc.get('author_id') in user_doc.get('following_ids', [])
        
        author = db.users.find_one({"google_id": doc.get('author_id')}, {"username": 1, "profile_picture_url": 1})
        doc['author_username'] = author.get('username', 'Unknown') if author else 'Unknown'
        doc['author_profile_picture_url'] = author.get('profile_picture_url') if author else None
        
    return all_content

def get_search_results(user_id: Optional[str], q: str = "", tags_filter: List[str] = None, exclude_tags: List[str] = None, sort_by: str = "recent", scope: str = "all") -> List[Dict[str, Any]]:
    """
    Search for posts and discussions using semantic embeddings and regex filters.
    'scope' can be 'all', 'bookmarks', or 'following'.
    """
    query: Dict[str, Any] = {}
    
    # 1. Scope Filtering
    if scope == "bookmarks" and user_id:
        user_doc = db.users.find_one({"google_id": user_id}, {"bookmark_ids": 1})
        bookmark_ids = user_doc.get('bookmark_ids', []) if user_doc else []
        query["_id"] = {"$in": bookmark_ids}
    elif scope == "following" and user_id:
        user_doc = db.users.find_one({"google_id": user_id}, {"following_ids": 1})
        following_ids = user_doc.get('following_ids', []) if user_doc else []
        query["author_id"] = {"$in": following_ids}

    # 2. Text Search (Optional if q is provided, we use semantic search primarily)
    # We still keep the query dict for tag/scope filters
    if q:
        # We'll use regex only as a fallback or combined if needed, 
        # but for now let's focus on fetching potential candidates for semantic comparison.
        pass
    
    if tags_filter:
        query["tags"] = {"$all": tags_filter}

    if exclude_tags:
        if "tags" in query:
            query["tags"]["$nin"] = exclude_tags
        else:
            query["tags"] = {"$nin": exclude_tags}

    # Re-use fetch_and_format logic for counts and booleans
    # We need to pass a query to it
    def fetch_with_query(q_obj):
        posts = list(db.posts.find(q_obj))
        discussions = list(db.discussions.find(q_obj))
        
        user_doc = None
        user_bookmarks = []
        user_following = []
        if user_id:
            user_doc = db.users.find_one({"google_id": user_id}, {"bookmark_ids": 1, "following_ids": 1})
            if user_doc:
                user_bookmarks = user_doc.get('bookmark_ids', [])
                user_following = user_doc.get('following_ids', [])

        all_content = posts + discussions
        for doc in all_content:
            doc['_id'] = str(doc['_id'])
            liked_by = doc.get('liked_by_user_ids', [])
            doc['likes_count'] = len(liked_by)
            doc['comments_count'] = len(doc.get('comment_ids', []))
            doc['is_liked'] = user_id in liked_by if user_id else False
            doc['is_bookmarked'] = str(doc['_id']) in user_bookmarks if user_id else False
            doc['is_following'] = doc.get('author_id') in user_following if user_id else False
            
            author = db.users.find_one({"google_id": doc.get('author_id')}, {"username": 1, "profile_picture_url": 1})
            doc['author_username'] = author.get('username', 'Unknown') if author else 'Unknown'
            doc['author_profile_picture_url'] = author.get('profile_picture_url') if author else None
        return all_content

    results = fetch_with_query(query)

    # 3. Semantic Search Ranking
    if q and results:
        query_embedding = embeddings.embedding_manager.generate_embedding(q)
        for doc in results:
            doc_embedding = doc.get('title_embedding')
            if doc_embedding:
                score = embeddings.embedding_manager.cosine_similarity(query_embedding, doc_embedding)
            else:
                # Fallback score if embedding is missing
                score = 0.0
            doc['search_score'] = score
        
        # Sort by search score primarily if a query is provided
        results.sort(key=lambda x: x.get('search_score', 0), reverse=True)
    else:
        # Sorting for non-query searches
        if sort_by in ["popular", "top", "likes"]:
            results.sort(key=lambda x: x.get('likes_count', 0), reverse=True)
        elif sort_by in ["hot", "views"]:
            results.sort(key=lambda x: x.get('views', 0), reverse=True)
        else: # recent / new
            results.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
    return results


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
    author = db.users.find_one({"google_id": author_id}, {"username": 1, "profile_picture_url": 1})
    data['author_username'] = author.get('username', 'Unknown') if author else 'Unknown'
    data['author_profile_picture_url'] = author.get('profile_picture_url') if author else None
            
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
        author = db.users.find_one({"google_id": doc.get('author_id')}, {"username": 1, "profile_picture_url": 1})
        doc['author_username'] = author.get('username', 'Unknown') if author else 'Unknown'
        doc['author_profile_picture_url'] = author.get('profile_picture_url') if author else None
            
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

def toggle_bookmark(user_id: str, content_id: str) -> Optional[bool]:
    """
    Toggles a bookmark for a post or discussion in the user's library.
    Returns True if bookmarked, False if unbookmarked, None if content not found.
    """
    # Verify content exists (in posts or discussions)
    doc = db.posts.find_one({"_id": content_id})
    if not doc:
        doc = db.discussions.find_one({"_id": content_id})
    
    if not doc:
        return None
        
    # Check if already bookmarked by the user
    user = db.users.find_one({"google_id": user_id})
    if not user:
        return None
        
    bookmark_ids = user.get('bookmark_ids', [])
    if content_id in bookmark_ids:
        # Unbookmark
        db.users.update_one(
            {"google_id": user_id},
            {"$pull": {"bookmark_ids": content_id}}
        )
        return False
    else:
        # Bookmark
        db.users.update_one(
            {"google_id": user_id},
            {"$addToSet": {"bookmark_ids": content_id}}
        )
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
        
        # Remove from all users' bookmarks
        db.users.update_many({}, {"$pull": {"bookmark_ids": content_id}})
        return True
    
    return False
    
def admin_delete_content(content_id: str) -> bool:
    """
    Deletes any post or discussion, bypassing the authorship check.
    Used for administration and moderation purposes.
    
    Args:
        content_id: The ID of the content to delete
    
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
    
    author_id = doc.get('author_id')
    
    # Delete all associated comments recursively
    comment_ids = doc.get('comment_ids', [])
    for comment_id in comment_ids:
        _delete_comment_recursive(comment_id)
    
    # Delete the content
    result = collection.delete_one({"_id": content_id})
    
    if result.deleted_count > 0:
        # Remove content ID from author's profile if author exists
        if author_id:
            if content_type == 'post':
                db.users.update_one(
                    {"google_id": author_id},
                    {"$pull": {"uploaded_doc_ids": content_id}}
                )
            elif content_type == 'discussion':
                db.users.update_one(
                    {"google_id": author_id},
                    {"$pull": {"discussion_ids": content_id}}
                )
            
            # Reverse the karma gain for the author
            karma.update_karma_on_delete(author_id, content_type)
        
        # Remove from all users' bookmarks
        db.users.update_many({}, {"$pull": {"bookmark_ids": content_id}})
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

def admin_delete_comment(comment_id: str) -> bool:
    """
    Deletes any comment, bypassing the authorship check.
    Used for administration and moderation purposes.
    
    Args:
        comment_id: The ID of the comment to delete
    
    Returns:
        True if deleted successfully, False otherwise
    """
    # Find the comment
    comment = db.comments.find_one({"_id": comment_id})
    
    if not comment:
        return False
    
    author_id = comment.get('author_id')
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
        
        # Reverse the karma gain for the author
        if author_id:
            karma.update_karma_on_delete(author_id, "comment")
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
