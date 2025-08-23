from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
from app.schemas.common import SupportedLanguage

class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50, regex="^[a-zA-Z0-9_-]+$")
    full_name: Optional[str] = Field(None, max_length=255)
    preferred_language: SupportedLanguage = SupportedLanguage.PYTHON
    notification_email: bool = True
    notification_webhook: bool = False

class UserCreate(UserBase):
    """Schema for user registration."""
    password: str = Field(..., min_length=8, max_length=128)
    
    @validator('password')
    def validate_password(cls, v):
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v

class UserUpdate(BaseModel):
    """Schema for user profile updates."""
    full_name: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = Field(None, max_length=1000)
    preferred_language: Optional[SupportedLanguage] = None
    notification_email: Optional[bool] = None
    notification_webhook: Optional[bool] = None

class UserUpdateRequest(BaseModel):
    """Schema for user profile update requests."""
    full_name: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = Field(None, max_length=1000)
    preferred_language: Optional[SupportedLanguage] = None
    notification_email: Optional[bool] = None
    notification_webhook: Optional[bool] = None

class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str

class UserResponse(UserBase):
    """Schema for user response (excluding sensitive data)."""
    id: int
    is_active: bool
    is_verified: bool
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    github_username: Optional[str] = None
    gitlab_username: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    """Schema for authentication token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class RefreshTokenRequest(BaseModel):
    """Schema for token refresh request."""
    refresh_token: str

class PasswordResetRequest(BaseModel):
    """Schema for password reset request."""
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    """Schema for password reset confirmation."""
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)
    
    @validator('new_password')
    def validate_password(cls, v):
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v
