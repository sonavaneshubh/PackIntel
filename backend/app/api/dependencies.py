from fastapi import Depends
from app.core.security import verify_auth_token


async def get_current_user(user: dict = Depends(verify_auth_token)) -> dict:
    return user
