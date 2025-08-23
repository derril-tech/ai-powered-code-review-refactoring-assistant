from sqlalchemy import Column, String, Integer, Boolean, JSON, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
import enum
from app.db.base import Base, TimestampMixin

class RepositoryProvider(str, enum.Enum):
    GITHUB = "github"
    GITLAB = "gitlab"
    BITBUCKET = "bitbucket"

class RepositoryStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    PENDING = "pending"

class Repository(Base, TimestampMixin):
    __tablename__ = "repositories"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Repository identification
    provider = Column(Enum(RepositoryProvider), nullable=False)
    external_id = Column(String(255), nullable=False)  # GitHub repo ID, GitLab project ID, etc.
    name = Column(String(255), nullable=False)
    full_name = Column(String(500), nullable=False)  # owner/repo-name
    description = Column(Text, nullable=True)
    
    # Repository configuration
    default_branch = Column(String(100), default="main", nullable=False)
    private = Column(Boolean, default=False, nullable=False)
    fork = Column(Boolean, default=False, nullable=False)
    
    # Integration settings
    webhook_id = Column(String(255), nullable=True)  # External webhook ID
    webhook_url = Column(String(500), nullable=True)
    webhook_secret = Column(String(255), nullable=True)
    
    # Access tokens and permissions
    access_token = Column(String(500), nullable=True)  # Encrypted
    token_expires_at = Column(String(50), nullable=True)
    permissions = Column(JSON, nullable=True)  # Repository permissions
    
    # Status and settings
    status = Column(Enum(RepositoryStatus), default=RepositoryStatus.PENDING, nullable=False)
    settings_json = Column(JSON, nullable=True)  # Repository-specific settings
    last_analysis_at = Column(String(50), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="repositories")
    analyses = relationship("Analysis", back_populates="repository", cascade="all, delete-orphan")
    files = relationship("RepositoryFile", back_populates="repository", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Repository(id={self.id}, name='{self.full_name}', provider='{self.provider}')>"

class RepositoryFile(Base, TimestampMixin):
    __tablename__ = "repository_files"
    
    id = Column(Integer, primary_key=True, index=True)
    repository_id = Column(Integer, ForeignKey("repositories.id"), nullable=False)
    
    # File information
    path = Column(String(500), nullable=False)
    name = Column(String(255), nullable=False)
    size = Column(Integer, nullable=True)
    language = Column(String(50), nullable=True)
    
    # Content tracking
    content_hash = Column(String(64), nullable=False)  # SHA256 of file content
    content_ref = Column(String(500), nullable=True)  # S3 reference or storage location
    
    # Git information
    commit_sha = Column(String(100), nullable=False)
    branch = Column(String(100), nullable=False)
    
    # Analysis metadata
    last_analyzed_at = Column(String(50), nullable=True)
    analysis_count = Column(Integer, default=0, nullable=False)
    
    # Relationships
    repository = relationship("Repository", back_populates="files")
    chunks = relationship("FileChunk", back_populates="file", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<RepositoryFile(id={self.id}, path='{self.path}', language='{self.language}')>"

class FileChunk(Base, TimestampMixin):
    __tablename__ = "file_chunks"
    
    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("repository_files.id"), nullable=False)
    
    # Chunk information
    start_line = Column(Integer, nullable=False)
    end_line = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    
    # Vector embedding for semantic search
    embedding = Column(String, nullable=True)  # pgvector VECTOR(1536)
    
    # Analysis metadata
    token_count = Column(Integer, nullable=True)
    complexity_score = Column(Integer, nullable=True)
    
    # Relationships
    file = relationship("RepositoryFile", back_populates="chunks")
    
    def __repr__(self):
        return f"<FileChunk(id={self.id}, lines={self.start_line}-{self.end_line})>"
