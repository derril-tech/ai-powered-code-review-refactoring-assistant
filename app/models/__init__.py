# Import all models for Alembic to detect them
from app.models.user import User
from app.models.analysis import Analysis, AnalysisFinding, AnalysisStatus, FindingSeverity, FindingType

__all__ = [
    "User",
    "Analysis", 
    "AnalysisFinding",
    "AnalysisStatus",
    "FindingSeverity", 
    "FindingType"
]
