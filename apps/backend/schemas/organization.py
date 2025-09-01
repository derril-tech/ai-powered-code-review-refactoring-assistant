from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class OrganizationBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None

class OrganizationResponse(OrganizationBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class OrganizationMemberBase(BaseModel):
    role: str

class OrganizationMemberCreate(BaseModel):
    email: EmailStr
    role: str = "member"

class OrganizationMemberResponse(BaseModel):
    id: int
    organization_id: int
    user_id: int
    role: str
    joined_at: datetime
    
    class Config:
        from_attributes = True

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: Optional[str] = None

class RoleCreate(RoleBase):
    pass

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[str] = None

class RoleResponse(RoleBase):
    id: int
    is_system: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserRoleBase(BaseModel):
    role_id: int
    organization_id: Optional[int] = None

class UserRoleCreate(UserRoleBase):
    pass

class UserRoleResponse(UserRoleBase):
    id: int
    user_id: int
    granted_at: datetime
    granted_by: Optional[int] = None
    
    class Config:
        from_attributes = True



