from typing import Dict, Any, Optional, List
from obj.post_discussion_comment import Post, Discussion, Comment
from util.dbconn import db
from util import embeddings
from datetime import datetime, timezone

def create_content(content_data: Dict[str, Any], user_id: str, _id: Optional[str] = None) -> Optional[Dict[str, Any]]:
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
            file_paths=content_data.get('file_paths', [])
        )
        collection = db.discussions
    else:
        return None
        
    data = content.to_dict(include_secrets=True)
    data['title_embedding'] = embeddings.embedding_manager.generate_embedding(title)
    
    result = collection.insert_one(data)
    
    if result.inserted_id:
        from util import tags
        tags.ensure_tags_exist(content_data.get('tags', []), created_by=user_id)
        
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
        
        data['_id'] = str(data['_id'])
        return data
        
    return None

def get_recommended_content(user_id: Optional[str], sort_by: str = 'recent', limit: int = 10, skip: int = 0, filter_tags: Optional[List[str]] = None, exclude_tags: Optional[List[str]] = None, content_type: Optional[str] = None) -> list:
    interested_tags = []
    following_ids = []
    
    if user_id:
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
        
        content_ids = [str(doc['_id']) for doc in all_content]
        user_liked_set = set()
        
        if user_id and content_ids:
            liked_docs = db.likes.find({
                "user_id": user_id, 
                "content_id": {"$in": content_ids}
            })
            user_liked_set = {ld["content_id"] for ld in liked_docs}

        for doc in all_content:
            doc_id_str = str(doc['_id'])
            doc['_id'] = doc_id_str
            doc['like_count'] = doc.get('like_count', 0)
            doc['comments_count'] = len(doc.get('comment_ids', []))
            doc['is_liked'] = doc_id_str in user_liked_set
            doc['is_bookmarked'] = doc_id_str in user_bookmarks if user_id else False
            doc['is_following'] = doc.get('author_id') in following_ids if user_id else False
            doc.pop('liked_by_user_ids', None)
            
            if 'tags' not in doc:
                doc['tags'] = []
            
            author = db.users.find_one({"google_id": doc.get('author_id')}, {"username": 1, "profile_picture_url": 1})
            doc['author_username'] = author.get('username', 'Unknown') if author else 'Unknown'
            doc['author_profile_picture_url'] = author.get('profile_picture_url') if author else None
            
        return all_content

    # Build query
    query = {}

    # Include tags filter
    if filter_tags:
        query["tags"] = {"$in": filter_tags}
    elif interested_tags or following_ids:
        or_conditions = []
        if interested_tags:
            or_conditions.append({"tags": {"$in": interested_tags}})
        if following_ids:
            or_conditions.append({"author_id": {"$in": following_ids}})
        query["$or"] = or_conditions

    # Exclude tags filter
    if exclude_tags:
        query["tags"] = query.get("tags", {})
        if isinstance(query["tags"], dict):
            query["tags"]["$nin"] = exclude_tags
        else:
            query["tags"] = {"$nin": exclude_tags}

    content = fetch_and_format(query)

    # Fallback to all content if nothing found
    if not content:
        fallback_query = {}
        if exclude_tags:
            fallback_query["tags"] = {"$nin": exclude_tags}
        content = fetch_and_format(fallback_query)

    # Sorting
    if sort_by == 'likes':
        content.sort(key=lambda x: x.get('like_count', 0), reverse=True)
    elif sort_by == 'views':
        content.sort(key=lambda x: x.get('views', 0), reverse=True)
    elif sort_by == 'comments':
        content.sort(key=lambda x: x.get('comments_count', 0), reverse=True)
    else:  # recent / date
        content.sort(key=lambda x: x.get('created_at', ''), reverse=True)

    final_content = content[skip:skip+limit]
    for doc in final_content:
        doc.pop('title_embedding', None)
        
    return final_content


def get_content_by_id(content_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    db.posts.update_one({"_id": content_id}, {"$inc": {"views": 1}})
    db.discussions.update_one({"_id": content_id}, {"$inc": {"views": 1}})

    doc = db.posts.find_one({"_id": content_id})
    if not doc:
        doc = db.discussions.find_one({"_id": content_id})
    
    if doc:
        doc['_id'] = str(doc['_id'])
        liked_by = doc.get('liked_by_user_ids', [])
        comment_ids = doc.get('comment_ids', [])
        
        doc['like_count'] = doc.get('like_count', 0)
        doc['comments_count'] = len(comment_ids)
        doc['is_liked'] = user_id in liked_by if user_id else False
        
        if user_id:
            has_liked = db.likes.find_one({"content_id": content_id, "user_id": user_id})
            doc['is_liked'] = has_liked is not None
            
            user_doc = db.users.find_one({"google_id": user_id}, {"bookmark_ids": 1, "following_ids": 1})
            doc['is_bookmarked'] = str(doc['_id']) in user_doc.get('bookmark_ids', []) if user_doc else False
            doc['is_following'] = doc.get('author_id') in user_doc.get('following_ids', []) if user_doc else False
        else:
            doc['is_liked'] = False
            doc['is_bookmarked'] = False
            doc['is_following'] = False

        author = db.users.find_one({"google_id": doc.get('author_id')}, {"username": 1, "profile_picture_url": 1})
        doc['author_username'] = author.get('username', 'Unknown') if author else 'Unknown'
        doc['author_profile_picture_url'] = author.get('profile_picture_url') if author else None
        return doc
    return None

def get_user_bookmarks(user_id: str) -> List[Dict[str, Any]]:
    user_doc = db.users.find_one({"google_id": user_id}, {"bookmark_ids": 1, "following_ids": 1})
    if not user_doc:
        return []
        
    bookmark_ids = user_doc.get('bookmark_ids', [])
    if not bookmark_ids:
        return []
        
    posts = list(db.posts.find({"_id": {"$in": bookmark_ids}}))
    discussions = list(db.discussions.find({"_id": {"$in": bookmark_ids}}))
    all_content = posts + discussions
    
    user_liked_set = set()
    if all_content:
        content_ids = [str(doc['_id']) for doc in all_content]
        liked_docs = db.likes.find({"user_id": user_id, "content_id": {"$in": content_ids}})
        user_liked_set = {ld["content_id"] for ld in liked_docs}
    
    for doc in all_content:
        doc_id_str = str(doc['_id'])
        doc['_id'] = doc_id_str
        doc['like_count'] = doc.get('like_count', 0)
        doc['comments_count'] = len(doc.get('comment_ids', []))
        doc['is_liked'] = doc_id_str in user_liked_set
        doc['is_bookmarked'] = True
        doc['is_following'] = doc.get('author_id') in user_doc.get('following_ids', [])
        doc.pop('liked_by_user_ids', None)
        
        author = db.users.find_one({"google_id": doc.get('author_id')}, {"username": 1, "profile_picture_url": 1})
        doc['author_username'] = author.get('username', 'Unknown') if author else 'Unknown'
        doc['author_profile_picture_url'] = author.get('profile_picture_url') if author else None
        
    return all_content

def get_search_results(user_id: Optional[str], q: str = "", tags_filter: List[str] = None, exclude_tags: List[str] = None, sort_by: str = "recent", scope: str = "all", skip: int = 0, limit: int = 10) -> List[Dict[str, Any]]:
    query: Dict[str, Any] = {}
    
    if scope == "owned" and user_id:
        query["author_id"] = user_id
    elif scope == "bookmarks" and user_id:
        user_doc = db.users.find_one({"google_id": user_id}, {"bookmark_ids": 1})
        bookmark_ids = user_doc.get('bookmark_ids', []) if user_doc else []
        query["_id"] = {"$in": bookmark_ids}
    elif scope == "following" and user_id:
        user_doc = db.users.find_one({"google_id": user_id}, {"following_ids": 1})
        following_ids = user_doc.get('following_ids', []) if user_doc else []
        query["author_id"] = {"$in": following_ids}

    if tags_filter:
        query["tags"] = {"$all": tags_filter}

    if exclude_tags:
        if "tags" in query:
            query["tags"]["$nin"] = exclude_tags
        else:
            query["tags"] = {"$nin": exclude_tags}

    def fetch_with_query(q_obj):
        posts = list(db.posts.find(q_obj))
        discussions = list(db.discussions.find(q_obj))
        
        user_bookmarks = []
        user_following = []
        if user_id:
            user_doc = db.users.find_one({"google_id": user_id}, {"bookmark_ids": 1, "following_ids": 1})
            if user_doc:
                user_bookmarks = user_doc.get('bookmark_ids', [])
                user_following = user_doc.get('following_ids', [])

        all_content = posts + discussions
        
        content_ids = [str(doc['_id']) for doc in all_content]
        user_liked_set = set()
        if user_id and content_ids:
            liked_docs = db.likes.find({"user_id": user_id, "content_id": {"$in": content_ids}})
            user_liked_set = {ld["content_id"] for ld in liked_docs}

        for doc in all_content:
            doc_id_str = str(doc['_id'])
            doc['_id'] = doc_id_str
            doc['like_count'] = doc.get('like_count', 0)
            doc['comments_count'] = len(doc.get('comment_ids', []))
            doc['is_liked'] = doc_id_str in user_liked_set
            doc['is_bookmarked'] = doc_id_str in user_bookmarks if user_id else False
            doc['is_following'] = doc.get('author_id') in user_following if user_id else False
            doc.pop('liked_by_user_ids', None)
            
            author = db.users.find_one({"google_id": doc.get('author_id')}, {"username": 1, "profile_picture_url": 1})
            doc['author_username'] = author.get('username', 'Unknown') if author else 'Unknown'
            doc['author_profile_picture_url'] = author.get('profile_picture_url') if author else None
        return all_content

    results = fetch_with_query(query)

    if q and results:
        query_embedding = embeddings.embedding_manager.generate_embedding(q)
        filtered_results = []
        lower_q = q.lower()
        
        for doc in results:
            doc_embedding = doc.get('title_embedding')
            title = doc.get('title', '')
            text_match_bonus = 1.0 if lower_q in title.lower() else 0.0
            
            if doc_embedding:
                semantic_score = embeddings.embedding_manager.cosine_similarity(query_embedding, doc_embedding)
            else:
                semantic_score = 0.0
                
            final_score = semantic_score + text_match_bonus
            doc['search_score'] = final_score
            
            if final_score > 0.3 or text_match_bonus > 0:
                filtered_results.append(doc)
                
        results = filtered_results
        results.sort(key=lambda x: x.get('search_score', 0), reverse=True)
    else:
        if sort_by == 'likes':
            results.sort(key=lambda x: x.get('like_count', 0), reverse=True)
        elif sort_by == 'views':
            results.sort(key=lambda x: x.get('views', 0), reverse=True)
        elif sort_by == 'comments':
            results.sort(key=lambda x: x.get('comments_count', 0), reverse=True)
        else:
            results.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
    final_results = results[skip:skip+limit]
    for doc in final_results:
        doc.pop('title_embedding', None)
        
    return final_results


def create_comment(parent_id: str, author_id: str, text: str) -> Optional[Dict[str, Any]]:
    new_comment = Comment(parent_id=parent_id, author_id=author_id, text=text)
    data = new_comment.to_dict(include_secrets=True)
    
    result = db.comments.insert_one(data)
    if not result.inserted_id:
        return None
        
    data['_id'] = str(data['_id'])
    
    updated = False
    res = db.posts.update_one({"_id": parent_id}, {"$push": {"comment_ids": data['_id']}})
    if res.modified_count > 0: updated = True
    
    if not updated:
        res = db.discussions.update_one({"_id": parent_id}, {"$push": {"comment_ids": data['_id']}})
        if res.modified_count > 0: updated = True
            
    if not updated:
        res = db.comments.update_one({"_id": parent_id}, {"$push": {"reply_ids": data['_id']}})
        if res.modified_count > 0: updated = True

    author = db.users.find_one({"google_id": author_id}, {"username": 1, "profile_picture_url": 1})
    data['author_username'] = author.get('username', 'Unknown') if author else 'Unknown'
    data['author_profile_picture_url'] = author.get('profile_picture_url') if author else None
            
    return data

def get_comment_tree(parent_id: str, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    parent = db.posts.find_one({"_id": parent_id})
    if not parent: parent = db.discussions.find_one({"_id": parent_id})
    if not parent: parent = db.comments.find_one({"_id": parent_id})
        
    if not parent:
        return []
        
    child_ids = parent.get('comment_ids') or parent.get('reply_ids') or []
    if not child_ids:
        return []
        
    cursor = db.comments.find({"_id": {"$in": child_ids}})
    comments = []
    
    user_liked_set = set()
    if user_id:
        liked_docs = db.likes.find({"user_id": user_id, "target_id": {"$in": child_ids}})
        user_liked_set = {str(ld["target_id"]) for ld in liked_docs}
    
    for doc in cursor:
        doc_id_str = str(doc['_id'])
        doc['_id'] = doc_id_str
        doc['like_count'] = doc.get('like_count', 0)
        doc['is_liked'] = doc_id_str in user_liked_set
        doc.pop('liked_by_user_ids', None)
        doc.pop('comment_ids', None)
        doc.pop('reply_ids', None)
        if 'author_id' in doc:
            doc['author_id'] = str(doc['author_id'])
        doc['replies'] = get_comment_tree(doc_id_str, user_id)    
        author = db.users.find_one({"google_id": doc.get('author_id')}, {"username": 1, "profile_picture_url": 1})
        doc['author_username'] = author.get('username', 'Unknown') if author else 'Unknown'
        doc['author_profile_picture_url'] = author.get('profile_picture_url') if author else None
            
        comments.append(doc)
        
    comments.sort(key=lambda x: x.get('created_at', ''), reverse=False)
    return comments

def toggle_like(content_id: str, user_id: str) -> Optional[bool]:
    target_collections = [db.posts, db.discussions, db.comments]
    found_collection = None

    for coll in target_collections:
        if coll.find_one({"_id": content_id}):
            found_collection = coll
            break
            
    if found_collection is None:
        return None

    result = db.likes.delete_one({"content_id": content_id, "user_id": user_id})
    
    if result.deleted_count > 0:
        found_collection.update_one({"_id": content_id}, {"$inc": {"like_count": -1}})
        return False
    else:
        db.likes.insert_one({
            "content_id": content_id,
            "user_id": user_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        found_collection.update_one({"_id": content_id}, {"$inc": {"like_count": 1}})
        return True
    
def toggle_comment_like(comment_id: str, user_id: str):
    existing_like = db.likes.find_one({"target_id": comment_id, "user_id": user_id, "type": "comment"})
    if existing_like:
        db.likes.delete_one({"_id": existing_like["_id"]})
        db.comments.update_one({"_id": comment_id}, {"$inc": {"like_count": -1}})
        return False
    else:
        db.likes.insert_one({"target_id": comment_id, "user_id": user_id, "type": "comment"})
        db.comments.update_one({"_id": comment_id}, {"$inc": {"like_count": 1}})
        return True

def toggle_bookmark(user_id: str, content_id: str) -> Optional[bool]:
    doc = db.posts.find_one({"_id": content_id})
    if not doc: doc = db.discussions.find_one({"_id": content_id})
    if not doc: return None
        
    user = db.users.find_one({"google_id": user_id})
    if not user: return None
        
    bookmark_ids = user.get('bookmark_ids', [])
    if content_id in bookmark_ids:
        db.users.update_one({"google_id": user_id}, {"$pull": {"bookmark_ids": content_id}})
        return False
    else:
        db.users.update_one({"google_id": user_id}, {"$addToSet": {"bookmark_ids": content_id}})
        return True

def delete_content(content_id: str, user_id: str) -> bool:
    doc = db.posts.find_one({"_id": content_id})
    collection = db.posts
    content_type = "post"
    
    if not doc:
        doc = db.discussions.find_one({"_id": content_id})
        collection = db.discussions
        content_type = "discussion"
    
    if not doc or doc.get('author_id') != user_id:
        return False
    
    comment_ids = doc.get('comment_ids', [])
    for comment_id in comment_ids:
        _delete_comment_recursive(comment_id)
    
    result = collection.delete_one({"_id": content_id})
    
    if result.deleted_count > 0:
        db.likes.delete_many({"content_id": content_id})
        if content_type == 'post':
            db.users.update_one({"google_id": user_id}, {"$pull": {"uploaded_doc_ids": content_id}})
        elif content_type == 'discussion':
            db.users.update_one({"google_id": user_id}, {"$pull": {"discussion_ids": content_id}})
        db.users.update_many({}, {"$pull": {"bookmark_ids": content_id}})
        return True
    return False
    
def admin_delete_content(content_id: str) -> bool:
    doc = db.posts.find_one({"_id": content_id})
    collection = db.posts
    content_type = "post"
    
    if not doc:
        doc = db.discussions.find_one({"_id": content_id})
        collection = db.discussions
        content_type = "discussion"
    
    if not doc:
        return False
    
    author_id = doc.get('author_id')
    comment_ids = doc.get('comment_ids', [])
    for comment_id in comment_ids:
        _delete_comment_recursive(comment_id)
    
    result = collection.delete_one({"_id": content_id})
    
    if result.deleted_count > 0:
        db.likes.delete_many({"content_id": content_id})
        if author_id:
            if content_type == 'post':
                db.users.update_one({"google_id": author_id}, {"$pull": {"uploaded_doc_ids": content_id}})
            elif content_type == 'discussion':
                db.users.update_one({"google_id": author_id}, {"$pull": {"discussion_ids": content_id}})
        db.users.update_many({}, {"$pull": {"bookmark_ids": content_id}})
        return True
    return False

def delete_comment(comment_id: str, user_id: str) -> bool:
    comment = db.comments.find_one({"_id": comment_id})
    if not comment or comment.get('author_id') != user_id:
        return False
    
    parent_id = comment.get('parent_id')
    reply_ids = comment.get('reply_ids', [])
    for reply_id in reply_ids:
        _delete_comment_recursive(reply_id)
    
    result = db.comments.delete_one({"_id": comment_id})
    
    if result.deleted_count > 0:
        db.likes.delete_many({"content_id": comment_id})
        db.posts.update_one({"_id": parent_id}, {"$pull": {"comment_ids": comment_id}})
        db.discussions.update_one({"_id": parent_id}, {"$pull": {"comment_ids": comment_id}})
        db.comments.update_one({"_id": parent_id}, {"$pull": {"reply_ids": comment_id}})
        return True
    return False

def admin_delete_comment(comment_id: str) -> bool:
    comment = db.comments.find_one({"_id": comment_id})
    if not comment:
        return False

    parent_id = comment.get('parent_id')
    reply_ids = comment.get('reply_ids', [])
    for reply_id in reply_ids:
        _delete_comment_recursive(reply_id)
    
    result = db.comments.delete_one({"_id": comment_id})
    
    if result.deleted_count > 0:
        db.likes.delete_many({"content_id": comment_id})
        db.posts.update_one({"_id": parent_id}, {"$pull": {"comment_ids": comment_id}})
        db.discussions.update_one({"_id": parent_id}, {"$pull": {"comment_ids": comment_id}})
        db.comments.update_one({"_id": parent_id}, {"$pull": {"reply_ids": comment_id}})
        return True
    return False

def _delete_comment_recursive(comment_id: str) -> None:
    comment = db.comments.find_one({"_id": comment_id})
    if not comment: return
    
    reply_ids = comment.get('reply_ids', [])
    for reply_id in reply_ids:
        _delete_comment_recursive(reply_id)
    
    db.comments.delete_one({"_id": comment_id})
    db.likes.delete_many({"content_id": comment_id})