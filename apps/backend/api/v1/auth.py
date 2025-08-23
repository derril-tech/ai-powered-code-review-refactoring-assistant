from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import (
    UserCreate, UserLogin, UserResponse, TokenResponse, 
    RefreshTokenRequest, PasswordResetRequest, PasswordResetConfirm
)
from app.core.security import (
    verify_password, get_password_hash, create_access_token, 
    create_refresh_token, verify_token
)
from app.services.email_service import send_verification_email, send_password_reset_email
from app.api.deps import get_login_rate_limit
from loguru import logger

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
    rate_limit=Depends(get_login_rate_limit)
):
    """Register a new user."""
    # Check if user already exists
    result = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    result = await db.execute(
        select(User).where(User.username == user_data.username)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        preferred_language=user_data.preferred_language,
        notification_email=user_data.notification_email,
        notification_webhook=user_data.notification_webhook
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Send verification email
    try:
        await send_verification_email(user.email, user.id)
    except Exception as e:
        logger.error(f"Failed to send verification email: {e}")
    
    return user

@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db),
    rate_limit=Depends(get_login_rate_limit)
):
    """Authenticate user and return tokens."""
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == credentials.email)
    )
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated"
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=30 * 60  # 30 minutes
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    """Refresh access token using refresh token."""
    try:
        payload = verify_token(refresh_data.refresh_token, "refresh")
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Verify user still exists and is active
        result = await db.execute(select(User).where(User.id == int(user_id)))
        user = result.scalar_one_or_none()
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Create new tokens
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=30 * 60
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

@router.post("/forgot-password")
async def forgot_password(
    reset_data: PasswordResetRequest,
    db: AsyncSession = Depends(get_db)
):
    """Send password reset email."""
    result = await db.execute(
        select(User).where(User.email == reset_data.email)
    )
    user = result.scalar_one_or_none()
    
    if user and user.is_active:
        try:
            await send_password_reset_email(user.email, user.id)
        except Exception as e:
            logger.error(f"Failed to send password reset email: {e}")
    
    # Always return success to prevent email enumeration
    return {"message": "If the email exists, a password reset link has been sent"}

@router.post("/reset-password")
async def reset_password(
    reset_data: PasswordResetConfirm,
    db: AsyncSession = Depends(get_db)
):
    """Reset password using token."""
    # This would typically validate the token and update the password
    # For now, we'll return a placeholder response
    return {"message": "Password reset functionality to be implemented"}
