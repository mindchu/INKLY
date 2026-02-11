from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from .dbconn import load_dotenv, db
import os
from fastapi import Request, HTTPException
from obj.user import User


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_FILE = os.path.join(BASE_DIR, '.env')

load_dotenv(ENV_FILE)

config = Config(ENV_FILE)
oauth = OAuth(config)

oauth.register(
    name='google',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

async def login(request: Request):
    if not oauth.google:
         raise HTTPException(status_code=500, detail="Google OAuth not configured")
    # Ensure the redirect URI matches what is configured in Google Cloud Console
    redirect_uri = request.url_for('auth_google')
    print(f"DEBUG: Generated redirect_uri: {redirect_uri}")
    return await oauth.google.authorize_redirect(request, redirect_uri)

async def authenticate(request: Request):
    if not oauth.google:
         raise HTTPException(status_code=500, detail="Google OAuth not configured")
    
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth Error: {str(e)}")

    user_info = token.get('userinfo')
    if not user_info:
         user_info = await oauth.google.userinfo(token=token)
    
    # Check if user exists
    user_data = db.users.find_one({"email": user_info['email']})
    if not user_data:
        # Create new user
        new_user = User.from_google_info(user_info)
        result = db.users.insert_one(new_user.to_dict())
        # Add _id to user_data for session, convert to string
        user_data = new_user.to_dict()
        user_data['_id'] = str(result.inserted_id)
        user_data['is_new'] = True
    else:
        user_data['_id'] = str(user_data['_id'])
        user_data['is_new'] = False

    return user_data
