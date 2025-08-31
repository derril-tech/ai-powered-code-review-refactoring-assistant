from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import uuid
from datetime import datetime
from typing import Optional, List

# Pydantic models for API requests/responses
class AnalysisRequest(BaseModel):
    repo_url: Optional[str] = None
    branch: Optional[str] = "main"
    commit_sha: Optional[str] = None
    language: str = "auto"
    analysis_type: str = "full"
    custom_rules: Optional[dict] = None

class AnalysisResponse(BaseModel):
    id: int
    status: str
    created_at: str
    repo_name: Optional[str] = None
    language: str
    analysis_type: str

class DashboardStats(BaseModel):
    total_analyses: int = 0
    active_analyses: int = 0
    total_findings: int = 0
    critical_findings: int = 0
    high_findings: int = 0
    total_proposals: int = 0
    applied_proposals: int = 0
    total_repositories: int = 0
    recent_analyses: List[dict] = []

# In-memory storage for demo (in production, this would be a database)
analyses_db = {}
analysis_counter = 1

# Create a simple FastAPI app
app = FastAPI(
    title="RefactorIQ Backend",
    description="AI-Powered Code Review Assistant",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "RefactorIQ Backend is running!",
        "status": "healthy",
        "version": "1.0.0",
        "api_docs": "/docs",
        "health_check": "/api/v1/health"
    }

@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "API is working",
        "database": "connected" if os.getenv("DATABASE_URL") else "not configured",
        "redis": "connected" if os.getenv("REDIS_URL") else "not configured"
    }

@app.get("/health")
async def simple_health():
    return {"status": "ok"}

@app.get("/api/v1/health/detailed")
async def detailed_health():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": "production",
        "services": {
            "database": "connected" if os.getenv("DATABASE_URL") else "not configured",
            "redis": "connected" if os.getenv("REDIS_URL") else "not configured"
        },
        "uptime": "running",
        "timestamp": "2024-01-01T00:00:00Z"
    }

@app.get("/health/detailed")
async def detailed_health_alt():
    """Alternative endpoint for frontend compatibility"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": "production",
        "services": {
            "database": "connected" if os.getenv("DATABASE_URL") else "not configured",
            "redis": "connected" if os.getenv("REDIS_URL") else "not configured"
        }
    }

# API Endpoints for functionality testing

@app.post("/api/v1/analyses", response_model=AnalysisResponse)
async def create_analysis(analysis: AnalysisRequest):
    """Create a new code analysis"""
    global analysis_counter
    
    # Create mock analysis
    analysis_id = analysis_counter
    analysis_counter += 1
    
    # Extract repo name from URL if provided
    repo_name = "Unknown Repository"
    if analysis.repo_url:
        repo_name = analysis.repo_url.split("/")[-1].replace(".git", "")
    
    new_analysis = {
        "id": analysis_id,
        "status": "queued",
        "created_at": datetime.now().isoformat(),
        "repo_name": repo_name,
        "repo_url": analysis.repo_url,
        "branch": analysis.branch,
        "language": analysis.language,
        "analysis_type": analysis.analysis_type,
        "progress": 0,
        "total_findings": 0,
        "critical_findings": 0,
        "high_findings": 0,
        "medium_findings": 0,
        "low_findings": 0
    }
    
    analyses_db[analysis_id] = new_analysis
    
    return AnalysisResponse(
        id=analysis_id,
        status="queued",
        created_at=new_analysis["created_at"],
        repo_name=repo_name,
        language=analysis.language,
        analysis_type=analysis.analysis_type
    )

@app.get("/api/v1/analyses")
async def get_analyses(page: int = 1, size: int = 10):
    """Get list of analyses"""
    analyses_list = list(analyses_db.values())
    analyses_list.reverse()  # Most recent first
    
    start = (page - 1) * size
    end = start + size
    paginated = analyses_list[start:end]
    
    return {
        "items": paginated,
        "total": len(analyses_list),
        "page": page,
        "size": size,
        "pages": (len(analyses_list) + size - 1) // size
    }

@app.get("/api/v1/analyses/{analysis_id}")
async def get_analysis(analysis_id: int):
    """Get specific analysis details"""
    if analysis_id not in analyses_db:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return analyses_db[analysis_id]

@app.get("/api/v1/stats/dashboard", response_model=DashboardStats)
async def get_dashboard_stats():
    """Get dashboard statistics"""
    analyses_list = list(analyses_db.values())
    
    # Calculate stats
    total_analyses = len(analyses_list)
    active_analyses = len([a for a in analyses_list if a["status"] in ["queued", "processing"]])
    total_findings = sum(a.get("total_findings", 0) for a in analyses_list)
    critical_findings = sum(a.get("critical_findings", 0) for a in analyses_list)
    high_findings = sum(a.get("high_findings", 0) for a in analyses_list)
    
    # Get recent analyses (last 5)
    recent_analyses = analyses_list[-5:] if analyses_list else []
    recent_analyses.reverse()
    
    return DashboardStats(
        total_analyses=total_analyses,
        active_analyses=active_analyses,
        total_findings=total_findings,
        critical_findings=critical_findings,
        high_findings=high_findings,
        total_proposals=0,  # Mock data
        applied_proposals=0,  # Mock data
        total_repositories=len(set(a.get("repo_url") for a in analyses_list if a.get("repo_url"))),
        recent_analyses=recent_analyses
    )

@app.get("/api/v1/repositories")
async def get_repositories():
    """Get list of repositories"""
    return {
        "items": [],
        "total": 0,
        "page": 1,
        "size": 10,
        "pages": 0
    }

@app.get("/api/v1/proposals")
async def get_proposals():
    """Get list of proposals"""
    return {
        "items": [],
        "total": 0,
        "page": 1,
        "size": 10,
        "pages": 0
    }

# File Upload Endpoints

@app.post("/api/v1/uploads/presign")
async def get_presigned_url(file_data: dict):
    """Get presigned URL for file upload (mock implementation)"""
    filename = file_data.get("filename", "unknown.txt")
    
    # Mock presigned URL response
    return {
        "upload_url": "https://mock-upload-url.com/upload",
        "file_url": f"https://mock-storage.com/files/{uuid.uuid4()}/{filename}",
        "fields": {
            "key": f"uploads/{uuid.uuid4()}/{filename}",
            "policy": "mock-policy",
            "signature": "mock-signature"
        }
    }

@app.post("/api/v1/uploads/analyze")
async def analyze_file(file_data: dict):
    """Start analysis of uploaded file"""
    global analysis_counter
    
    # Create mock analysis for uploaded file
    analysis_id = analysis_counter
    analysis_counter += 1
    
    file_url = file_data.get("file_url", "")
    filename = file_url.split("/")[-1] if file_url else "uploaded_file"
    
    new_analysis = {
        "id": analysis_id,
        "status": "processing",
        "created_at": datetime.now().isoformat(),
        "repo_name": f"Uploaded: {filename}",
        "repo_url": None,
        "branch": None,
        "language": file_data.get("language", "auto"),
        "analysis_type": file_data.get("analysis_type", "full"),
        "progress": 25,  # Simulate some progress
        "total_findings": 3,  # Mock findings
        "critical_findings": 1,
        "high_findings": 1,
        "medium_findings": 1,
        "low_findings": 0,
        "file_url": file_url
    }
    
    analyses_db[analysis_id] = new_analysis
    
    return {
        "id": analysis_id,
        "status": "processing",
        "message": "File analysis started successfully"
    }

@app.post("/api/v1/uploads")
async def upload_files(files: List[UploadFile] = File(...)):
    """Direct file upload endpoint"""
    uploaded_files = []
    
    for file in files:
        # Mock file processing
        file_info = {
            "filename": file.filename,
            "size": file.size if hasattr(file, 'size') else 0,
            "type": file.content_type,
            "upload_id": str(uuid.uuid4())
        }
        uploaded_files.append(file_info)
    
    return {
        "upload_id": str(uuid.uuid4()),
        "files": uploaded_files,
        "message": "Files uploaded successfully"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
