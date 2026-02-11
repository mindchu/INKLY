from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from starlette.config import Config
from api import router as api_router

# Load config for SECRET_KEY
config = Config('.env')
SECRET_KEY = config('SECRET_KEY', default='unsafe-secret-key')
API_HOST = config('API_HOST', default='localhost')
API_PORT = config('API_PORT', cast=int, default=5001)
FRONTEND_PORT = config('FRONTEND_PORT', cast=int, default=5173)

app = FastAPI()

app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)

# Add CORS middleware
from fastapi.middleware.cors import CORSMiddleware

origins = [
    f"http://{API_HOST}:{FRONTEND_PORT}",  # Frontend URL
    f"http://127.0.0.1:{FRONTEND_PORT}",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "Welcome to INKLY Backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=API_HOST, port=API_PORT, reload=True)