from fastapi import APIRouter
from routes import auth, users, content, tags, admin

router = APIRouter()

router.include_router(auth.router)
router.include_router(users.router)
router.include_router(content.router)
router.include_router(tags.router)
router.include_router(admin.router)