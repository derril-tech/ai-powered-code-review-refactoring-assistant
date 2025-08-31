from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.organization import Organization, OrganizationMember
from app.models.user import User
from app.schemas.organization import (
    OrganizationCreate, OrganizationUpdate, OrganizationResponse,
    OrganizationMemberCreate, OrganizationMemberResponse
)
from app.api.deps import get_current_user
from app.services.auth_service import check_permission

router = APIRouter()

@router.post("/", response_model=OrganizationResponse)
async def create_organization(
    organization: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new organization"""
    # Check if user has permission to create organizations
    if not check_permission(current_user, "organizations:create"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create organizations"
        )
    
    # Check if organization slug already exists
    existing_org = db.query(Organization).filter(Organization.slug == organization.slug).first()
    if existing_org:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization with this slug already exists"
        )
    
    # Create organization
    db_organization = Organization(
        name=organization.name,
        slug=organization.slug,
        description=organization.description,
        website=organization.website,
        logo_url=organization.logo_url
    )
    db.add(db_organization)
    db.commit()
    db.refresh(db_organization)
    
    # Add current user as owner
    member = OrganizationMember(
        organization_id=db_organization.id,
        user_id=current_user.id,
        role="owner"
    )
    db.add(member)
    db.commit()
    
    return db_organization

@router.get("/", response_model=List[OrganizationResponse])
async def list_organizations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List organizations the user is a member of"""
    # Get user's organization memberships
    memberships = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id
    ).all()
    
    organization_ids = [m.organization_id for m in memberships]
    organizations = db.query(Organization).filter(
        Organization.id.in_(organization_ids)
    ).all()
    
    return organizations

@router.get("/{organization_id}", response_model=OrganizationResponse)
async def get_organization(
    organization_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get organization details"""
    # Check if user is member of organization
    membership = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == organization_id,
        OrganizationMember.user_id == current_user.id
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found or access denied"
        )
    
    organization = db.query(Organization).filter(Organization.id == organization_id).first()
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    return organization

@router.put("/{organization_id}", response_model=OrganizationResponse)
async def update_organization(
    organization_id: int,
    organization_update: OrganizationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update organization details"""
    # Check if user is admin or owner of organization
    membership = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == organization_id,
        OrganizationMember.user_id == current_user.id
    ).first()
    
    if not membership or membership.role not in ["owner", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to update organization"
        )
    
    organization = db.query(Organization).filter(Organization.id == organization_id).first()
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    # Update fields
    for field, value in organization_update.dict(exclude_unset=True).items():
        setattr(organization, field, value)
    
    db.commit()
    db.refresh(organization)
    
    return organization

@router.post("/{organization_id}/members", response_model=OrganizationMemberResponse)
async def add_organization_member(
    organization_id: int,
    member: OrganizationMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a member to the organization"""
    # Check if user is admin or owner of organization
    membership = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == organization_id,
        OrganizationMember.user_id == current_user.id
    ).first()
    
    if not membership or membership.role not in ["owner", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to add members"
        )
    
    # Check if user exists
    user = db.query(User).filter(User.email == member.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user is already a member
    existing_member = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == organization_id,
        OrganizationMember.user_id == user.id
    ).first()
    
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this organization"
        )
    
    # Add member
    new_member = OrganizationMember(
        organization_id=organization_id,
        user_id=user.id,
        role=member.role
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    
    return new_member

@router.get("/{organization_id}/members", response_model=List[OrganizationMemberResponse])
async def list_organization_members(
    organization_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List organization members"""
    # Check if user is member of organization
    membership = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == organization_id,
        OrganizationMember.user_id == current_user.id
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found or access denied"
        )
    
    members = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == organization_id
    ).all()
    
    return members


