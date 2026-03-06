## Guide: Implementing Dynamic Infinite Scrolling

Currently, the system only fetches the first 10 contents. To dynamically fetch more items as the user scrolls, follow this architecture:

### 1. Update Backend (FastAPI) to Support Pagination
Ensure the content fetching endpoint accepts `skip` and `limit` parameters to return segmented data batches.

```python
@router.get("/content")
async def get_content(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    # Query database using offset (skip) and limit
    content = db.query(ContentModel).offset(skip).limit(limit).all()
    return content
```

### 2. Update Frontend (React) State to Handle Pagination
In the component displaying the feed (e.g., `note_forum_page.jsx`), keep track of the current `page`, the accumulated `items`, and a `hasMore` flag.

```javascript
import { useState, useEffect, useRef, useCallback } from "react";

const [items, setItems] = useState([]);
const [page, setPage] = useState(0);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);
const limit = 10;
```

### 3. Fetch Data Iteratively
Create a fetch function that appends new items to the existing list state rather than overwriting it.

```javascript
const fetchContent = async (pageNum) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
        const skip = pageNum * limit;
        const response = await fetch(`/api/content?skip=${skip}&limit=${limit}`);
        const data = await response.json();
        
        if (data.length === 0) {
            setHasMore(false); // Stop fetching when no more items are returned
        } else {
            setItems(prevItems => [...prevItems, ...data]);
        }
    } catch (error) {
        console.error("Error fetching content:", error);
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    fetchContent(page);
}, [page]);
```

### 4. Detect Scroll using IntersectionObserver
Attach a `ref` to the last element in the rendered list. When this element intersects with the viewport, increment the page.

```javascript
const observer = useRef();
const lastItemRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
        // If the last element is visible on screen, load next page
        if (entries[0].isIntersecting && hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    });
    
    if (node) observer.current.observe(node);
}, [loading, hasMore]);
```

### 5. Attach the Ref in Render
Map through the `items` and attach `lastItemRef` ONLY to the last mapped item.

```javascript
return (
    <div className="content-feed">
        {items.map((item, index) => {
            if (items.length === index + 1) {
                // Attach ref to the last item
                return <div ref={lastItemRef} key={item.id}>{item.title}</div>;
            } else {
                return <div key={item.id}>{item.title}</div>;
            }
        })}
        {loading && <p>Loading more...</p>}
        {!hasMore && <p>You've reached the end!</p>}
    </div>
);
```
By combining the backend pagination and the frontend `IntersectionObserver`, the system will seamlessly fetch the next batch of 10 items only when the user scrolls to the bottom of the page.
