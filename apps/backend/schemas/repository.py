"""
Repository schemas for API requests and responses.
"""

from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.repository import RepositoryProvider, RepositoryStatus

class RepositoryBase(BaseModel):
    provider: RepositoryProvider
    name: str
    full_name: str
    description: Optional[str] = None
    default_branch: str = "main"
    private: bool = False
    fork: bool = False

class RepositoryCreate(RepositoryBase):
    external_id: str
    webhook_enabled: bool = True

class RepositoryUpdate(BaseModel):
    description: Optional[str] = None
    default_branch: Optional[str] = None
    settings_json: Optional[Dict[str, Any]] = None
    webhook_enabled: Optional[bool] = None

class RepositoryResponse(RepositoryBase):
    id: int
    user_id: int
    external_id: str
    status: RepositoryStatus
    webhook_id: Optional[str] = None
    webhook_url: Optional[str] = None
    last_analysis_at: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class RepositoryConnectRequest(BaseModel):
    provider: RepositoryProvider
    repository_url: HttpUrl
    access_token: Optional[str] = None
    webhook_enabled: bool = True

class RepositoryConnectResponse(BaseModel):
    success: bool
    repository: Optional[RepositoryResponse] = None
    message: str
    webhook_url: Optional[str] = None

class RepositoryFileResponse(BaseModel):
    id: int
    repository_id: int
    path: str
    name: str
    size: Optional[int] = None
    language: Optional[str] = None
    content_hash: str
    commit_sha: str
    branch: str
    last_analyzed_at: Optional[str] = None
    analysis_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class FileChunkResponse(BaseModel):
    id: int
    file_id: int
    start_line: int
    end_line: int
    content: str
    token_count: Optional[int] = None
    complexity_score: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True



