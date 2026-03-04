# main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.config import Config

# Import all routers
from routes.auth_routes import router as auth_router
from routes.user_routes import router as user_router
from routes.post_routes import router as post_router
from routes.comment_routes import router as comment_router
from routes.admin_routes import router as admin_router
from routes.file_routes import router as file_router

# Load config
config = Config('.env')
SECRET_KEY = config('SECRET_KEY', default='unsafe-secret-key-change-in-prod')
API_HOST = config('API_HOST', default='localhost')
API_PORT = config('API_PORT', cast=int, default=5001)
FRONTEND_PORT = config('FRONTEND_PORT', cast=int, default=5173)

app = FastAPI(title="INKLY API")

# Mount Static Files (For avatars and attachments)
import os
os.makedirs("uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# CORS Middleware (Must be added first)
origins = [
    f"http://{API_HOST}:{FRONTEND_PORT}",
    f"http://127.0.0.1:{FRONTEND_PORT}",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session Middleware (For Google Auth state and user sessions)
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY, max_age=86400 * 7) # 7 days

# Include Routers
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(post_router)
app.include_router(comment_router)
app.include_router(admin_router)
app.include_router(file_router)

@app.get("/")
async def root():
    return {"message": "Welcome to INKLY Backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=API_HOST, port=API_PORT, reload=True)