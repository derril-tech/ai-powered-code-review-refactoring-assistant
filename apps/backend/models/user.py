from sqlalchemy import Column, String, Boolean, Text, Integer
from sqlalchemy.orm import relationship
from app.db.base import Base, TimestampMixin, SoftDeleteMixin

class User(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    
    # GitHub/GitLab integration
    github_id = Column(String(100), unique=True, index=True, nullable=True)
    gitlab_id = Column(String(100), unique=True, index=True, nullable=True)
    github_username = Column(String(100), nullable=True)
    gitlab_username = Column(String(100), nullable=True)
    
    # Preferences
    preferred_language = Column(String(50), default="python", nullable=False)
    notification_email = Column(Boolean, default=True, nullable=False)
    notification_webhook = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', username='{self.username}')>"
