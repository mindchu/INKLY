# INKLY

A social content platform for sharing and discussing documents with interest-based recommendations and community engagement features.

## Features

- 📝 **Content Sharing**: Create and share posts and documents with the community
- 💬 **Discussions**: Engage in threaded discussions with comments
- 🏷️ **Interest-Based Tags**: Organize content with tags and get personalized recommendations
- 👤 **User Profiles**: View user profiles with bio, and interests
- 👥 **Social Features**: Follow users, like content, and build your network
- 🔐 **Google OAuth**: Secure authentication via Google Sign-In
- 📤 **File Uploads**: Attach files to your posts and documents

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **MongoDB**: NoSQL database for flexible data storage
- **Authlib**: OAuth 2.0 authentication
- **Uvicorn**: ASGI server

### Frontend
- **React**: UI library with React Router for navigation
- **Vite**: Fast build tool and dev server
- **Lucide React**: Icon library

## Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB (via Docker or local installation)
- Google OAuth credentials

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd INKLY
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On macOS/Linux
pip install -r requirements.txt
```

#### Configure Environment Variables

Copy the template and fill in your credentials:

```bash
cp .env.template .env
```

Edit `.env` with your configuration:

```env
MONGO_USER=your_mongo_username
MONGO_PASS=your_mongo_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SECRET_KEY=your-secret-key-for-sessions
API_HOST=localhost
API_PORT=6001
FRONTEND_PORT=6601
```

#### Start MongoDB

Using Docker Compose:

```bash
#in backend folder
docker compose docker-compose.yml up -d
```

Or use your local MongoDB installation.

#### Run the Backend Server

```bash
uvicorn main:app --port 6001 --reload
```

The API will be available at `http://localhost:6001`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Configure Environment Variables

Copy the template and configure:

```bash
cp .env.template .env
```

Edit `.env`:

```env
VITE_API_HOST=localhost
VITE_API_PORT=6001
VITE_FRONTEND_PORT=6601
```

#### Run the Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:6601`

## Project Structure

```
INKLY/
├── backend/
│   ├── obj/                   # Data models (User, Post, Discussion, Comment)
│   ├── util/                  # Utility modules
│   │   ├── auth.py            # OAuth authentication
│   │   ├── content.py         # Content management
│   │   ├── dbconn.py          # Database connection
│   │   ├── files.py           # File upload handling
│   │   └── tags.py            # Tag management
│   ├── api.py                 # API routes
│   ├── main.py                # FastAPI application entry point
│   ├── requirements.txt       # Python dependencies
│   └── docker-compose.yml     # MongoDB container config
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── CreateContent.jsx
│   │   │   ├── PostDetail.jsx
│   │   │   ├── Documents.jsx
│   │   │   ├── Discussions.jsx
│   │   │   └── SelectInterests.jsx
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── package.json           # Node dependencies
│   └── vite.config.js         # Vite configuration
│
└── uploads/                   # User-uploaded files
```

## API Endpoints

### Authentication
- `GET /login/google` - Initiate Google OAuth login
- `GET /auth/google` - OAuth callback
- `GET /logout` - Logout user

### Users
- `GET /users/me` - Get current user profile
- `GET /users/{user_id}` - Get user by ID
- `PUT /users/me/bio` - Update user bio
- `POST /users/me/interests` - Update user interests
- `GET /users/{user_id}/posts` - Get user's posts
- `GET /users/{user_id}/discussions` - Get user's discussions
- `GET /users/{user_id}/followers` - Get user's followers
- `GET /users/{user_id}/following` - Get users being followed
- `POST /users/{user_id}/follow` - Toggle follow status

### Content
- `POST /content` - Create new post/discussion
- `GET /content/recommended` - Get recommended content
- `GET /content/{content_id}` - Get content details
- `POST /content/{content_id}/comment` - Add comment
- `POST /content/{content_id}/like` - Toggle like
- `DELETE /content/{content_id}` - Delete content
- `DELETE /content/{content_id}/comment/{comment_id}` - Delete comment

### Tags
- `GET /tags/popular` - Get popular tags

### Files
- `GET /uploads/{filename}` - Get uploaded file

## Development

### Backend Development

The backend uses FastAPI with hot-reload enabled. Any changes to Python files will automatically restart the server.

### Frontend Development

Vite provides hot module replacement (HMR) for instant updates during development.

### Database Management

Utility scripts are provided:
- `check_db.py` - Inspect database contents
- `clear_database.py` - Clear all collections (use with caution!)

## Building for Production

### Frontend

```bash
cd frontend
npm run build
```

The production build will be in `frontend/dist/`

### Backend

For production deployment, use a production ASGI server configuration and ensure environment variables are properly secured.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request