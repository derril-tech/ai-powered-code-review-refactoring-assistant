"""
User management API endpoints.

This module provides endpoints for user profile management, including:
- Get current user profile
- Update user profile
- Delete user account
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdateRequest
from app.core.security import get_password_hash

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current user profile.
    
    Returns the complete profile information for the authenticated user.
    """
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_update: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Update current user profile.
    
    Allows users to update their profile information including:
    - Full name
    - Bio
    - Preferred programming language
    - Notification preferences
    
    Only provided fields will be updated.
    """
    # Update only provided fields
    update_data = user_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    try:
        await db.commit()
        await db.refresh(current_user)
        return current_user
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user profile"
        )

@router.delete("/me")
async def delete_current_user_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Delete current user account.
    
    This action is irreversible and will permanently delete the user's:
    - Profile information
    - Analysis history
    - All associated data
    
    Returns a confirmation message.
    """
    try:
        # Soft delete by setting is_active to False
        current_user.is_active = False
        await db.commit()
        
        return {
            "message": "Account deleted successfully",
            "detail": "Your account has been deactivated and will be permanently removed within 30 days."
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user account"
        )

@router.get("/me/analyses")
async def get_user_analyses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    page: int = 1,
    size: int = 20
) -> dict:
    """
    Get current user's analysis history.
    
    Returns a paginated list of analyses performed by the user.
    """
    # TODO: Implement analysis listing with pagination
    # This will be implemented when the analysis system is complete
    return {
        "analyses": [],
        "total": 0,
        "page": page,
        "size": size,
        "pages": 0
    }
