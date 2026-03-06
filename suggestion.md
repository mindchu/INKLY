# Suggested Sequence Diagrams for INKLY

Here are 5 core use-cases in the INKLY project that are ideal for sequence diagrams. Only the chain of execution is provided below.

## 1. User Authentication (Google Login & Session Creation)
**Chain of Execution:**
1. **User** clicks "Login with Google" on the **Frontend**.
2. **Frontend** triggers the Google OAuth popup/redirect.
3. **Google** authenticates the user and returns an Auth Token to the **Frontend**.
4. **Frontend** sends the Auth Token to the **Backend** (e.g., `/auth/google`).
5. **Backend** verifies the token with Google's servers.
6. **Backend** queries **MongoDB** to check if the user exists:
   - If no, creates a new user profile.
   - If yes, fetches the user's details.
7. **Backend** generates a session JWT/Cookie and sends it in the response to the **Frontend**.
8. **Frontend** saves the session state and redirects the **User** to the Home Page.

## 2. Note Upload (with MongoDB GridFS)
**Chain of Execution:**
1. **User** fills in note metadata (title, description, tags) and attaches a file on the **Frontend**.
2. **User** clicks "Upload Note".
3. **Frontend** prepares the multipart form data and sends a POST request to the **Backend** (`/notes/upload`).
4. **Backend** receives the request and validates the user session.
5. **Backend** streams the uploaded file data into **MongoDB GridFS**.
6. **MongoDB GridFS** returns a unique `file_id` representing the stored file.
7. **Backend** creates a new Note Document in the regular **MongoDB** collection, linking it to the `file_id`.
8. **Backend** responds with a success status and the new Note ID.
9. **Frontend** updates the UI and navigates the **User** to the newly created Note page.

## 3. Generating the Personalized Feed (Interests & Followers)
**Chain of Execution:**
1. **User** navigates to the Home Feed on the **Frontend**.
2. **Frontend** sends a GET request to the **Backend** (`/feed`) including the user's session cookies.
3. **Backend** validates the session and identifies the requesting user.
4. **Backend** queries **MongoDB** to fetch the user's "Interests" and "Following" lists.
5. **Backend** queries the Notes/Discussions collections in **MongoDB** for documents matching the user's interests OR created by followed users.
6. **Backend** aggregates the results, applying sorting (e.g., chronological) and pagination limits.
7. **Backend** returns the generated list of feed items to the **Frontend**.
8. **Frontend** iterates through the list and renders the content for the **User**.

## 4. Discussion Interaction (Adding a Comment)
**Chain of Execution:**
1. **User** types a comment on a specific Discussion page and clicks "Submit" on the **Frontend**.
2. **Frontend** sends a POST request with the comment text to the **Backend** (`/discussions/{discussion_id}/comments`).
3. **Backend** validates the session and the comment payload (e.g., checking for empty text or max length).
4. **Backend** accesses **MongoDB** and appends the new comment object to the specified Discussion document.
5. *(Optional)* **Backend** creates a notification document in **MongoDB** for the owner of the Discussion.
6. **Backend** responds to the **Frontend** with the newly created comment object and success status.
7. **Frontend** dynamically adds the new comment to the discussion thread on the UI without requiring a full page reload.

## 5. User Follow Action (Preventing Self-Follow)
**Chain of Execution:**
1. **User A** visits **User B**'s profile and clicks the "Follow" button on the **Frontend**.
2. **Frontend** sends a POST request to the **Backend** (`/users/{user_b_id}/follow`).
3. **Backend** validates the session to identify the actor (**User A**).
4. **Backend** checks business logic constraints: Is **User A**'s ID the same as **User B**'s ID? (If yes, abort and return error).
5. **Backend** queries **MongoDB** to check if **User A** is already following **User B**.
6. If not following, **Backend** performs a transactional update in **MongoDB**:
   - Adds **User B**'s ID to **User A**'s `following` array.
   - Adds **User A**'s ID to **User B**'s `followers` array.
7. **Backend** responds with a success message to the **Frontend**.
8. **Frontend** changes the "Follow" button state to "Following" for **User A**.
