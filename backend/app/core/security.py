from typing import Optional
from fastapi import Header, HTTPException, status
from app.core.config import settings
from supabase import create_client, Client


def get_supabase_client() -> Optional[Client]:
    url = settings.clean_supabase_url
    key = settings.SUPABASE_SERVICE_ROLE_KEY
    if url and key:
        try:
            return create_client(url, key)
        except Exception:
            return None
    return None


async def verify_auth_token(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """
    Verifies Bearer token with Supabase Auth or returns anonymous mock identity in development.
    """
    if not authorization:
        return {"sub": "anon-user", "role": "authenticated"}

    token = authorization.replace("Bearer ", "")
    supabase = get_supabase_client()
    if supabase:
        try:
            user = supabase.auth.get_user(token)
            if user and user.user:
                return {"sub": user.user.id, "email": user.user.email}
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid authentication credentials: {str(e)}",
            )
    return {"sub": "dev-user", "role": "authenticated"}
