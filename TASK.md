Create a new FastAPI route GET /search in api.py
Read the q (query string) parameter from the URL
Write a MongoDB query to find documents in the content collection where title or text matches the q string using $regex
Return the matching documents as a JSON list
Add a tags query parameter (list of strings) to the GET /search URL
Update the MongoDB query to filter documents that contain the provided tags using $in or $all
Add a sort_by query parameter to the GET /search URL
If sort_by=recent, add .sort("created_at", -1) to the MongoDB query
If sort_by=popular, add .sort("likes", -1) to the MongoDB query
Create a new FastAPI route POST /bookmarks/{content_id} in api.py
Check if the user is authenticated (using session)
Query the database to see if content_id is already in the user's bookmarks array
If it is, remove it from the array using MongoDB $pull (unbookmark)
If it is not, add it to the array using MongoDB $addToSet (bookmark)
Return {"is_bookmarked": true/false}
Create a new FastAPI route GET /bookmarks in api.py
Check if the user is authenticated
Get the bookmarks array (list of IDs) from the user's database document
Query the content collection for all documents whose _id is in that bookmarks array
Return the list of bookmarked content as JSON
Open the existing GET /content/recommended and GET /content/{id} routes
For each content item being returned, check if its ID is in the current user's bookmarks array
Add a new boolean field is_bookmarked to the JSON response for each item
Find the existing PUT /users/me/bio route in api.py
Rename the route or create a new one: PUT /users/me/profile
Create a new Pydantic model that accepts both bio (string) and username (string)
Update the MongoDB $set command to update both bio and username
In the PUT /users/me/profile route, before saving, search the users collection for the requested username
If a different user already has this username, return an HTTP 400 Error ("Username already taken")
Create a new FastAPI route POST /users/me/avatar in api.py
Accept a file upload using FastAPI's UploadFile
Save the file to the uploads/ folder and generate a unique filename
Update the user's document in MongoDB, setting profile_picture_url to the new file's URL
Return the new URL in the JSON response
Find the existing GET /content/{content_id} route in api.py
Add a MongoDB database command to increment ($inc) the views field by 1 for this content_id
Check the GET /content/recommended and /users/{user_id}/posts routes
Make sure the returned JSON for each content item includes total likes_count and comments_count
Open the existing GET /content/recommended and GET /content/{id} routes
For each content item being returned, check if the current user's ID is in the item's liked_by array
Add a new boolean field is_liked to the JSON response for each item
Create a new FastAPI route GET /feed in api.py
Get the following_ids array and interests (tags) array from the current user's database document
Query the content collection to find documents where the author_id is in following_ids
ALSO match documents where the tags array contains any of the user's interests
Return these documents as JSON
Add a type query parameter to GET /feed and GET /content/recommended routes
If type=note, add { type: "note" } to the MongoDB query
If type=discussion, add { type: "discussion" } to the MongoDB query
Add a sort query parameter to the GET /feed route
Handle sort=most_recent by adding .sort("created_at", -1)
Handle sort=most_liked by adding .sort("likes", -1)
Handle sort=most_viewed by adding .sort("views", -1)
