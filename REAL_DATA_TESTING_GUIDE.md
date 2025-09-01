# Real Data Testing Guide

## Testing Workflow with Real Data

### 1. User Registration & Authentication
```bash
# 1. Go to http://localhost:3000
# 2. Click "Get Started" or "Register"
# 3. Create a new account
# 4. Verify you can login/logout
```

### 2. Repository Connection
```bash
# 1. Go to Repositories page
# 2. Click "Connect Repository"
# 3. Authorize with GitHub (uses your OAuth app)
# 4. Select a real repository to analyze
```

### 3. Code Analysis with Real Data
```bash
# Option A: Repository Analysis
# 1. Go to "New Analysis"
# 2. Enter a real GitHub repository URL
# 3. Select branch (e.g., main, develop)
# 4. Choose analysis type (Full, Security, Performance)
# 5. Click "Start Analysis"

# Option B: File Upload Analysis
# 1. Go to "New Analysis"
# 2. Upload real code files (.py, .js, .ts, etc.)
# 3. Start analysis
```

### 4. Real AI Analysis
```bash
# The system will:
# 1. Clone/download the repository
# 2. Send code to OpenAI API for analysis
# 3. Generate real findings and suggestions
# 4. Create actionable proposals
# 5. Show real-time progress via WebSocket
```

### 5. Review Real Results
```bash
# 1. View analysis results in dashboard
# 2. Check findings by severity (Critical, High, Medium, Low)
# 3. Review AI-generated proposals
# 4. Apply or reject suggestions
# 5. Export reports
```

## Test Data Sources

### Good Repositories for Testing:
```bash
# Small Python projects with issues:
https://github.com/your-username/small-python-project

# JavaScript/TypeScript projects:
https://github.com/your-username/react-app

# Public repositories (for testing):
https://github.com/octocat/Hello-World
```

### Test Files to Upload:
```python
# test_code.py - Python file with intentional issues
def calculate_fibonacci(n):
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    else:
        return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)  # Inefficient recursion

# Security issue
password = "hardcoded_password"  # Security vulnerability
```

```javascript
// test_code.js - JavaScript with issues
function processUserData(userData) {
    // No input validation
    eval(userData.code);  // Security vulnerability
    
    // Memory leak potential
    setInterval(() => {
        console.log("Running...");
    }, 1000);
    
    return userData;
}
```

## Expected Real Results

### What You Should See:
1. **Real AI Analysis**: Actual OpenAI-powered code review
2. **Genuine Findings**: Real security, performance, and quality issues
3. **Actionable Proposals**: Concrete code improvements
4. **Live Updates**: Real-time progress via WebSocket
5. **Persistent Data**: Results saved to PostgreSQL database

### Performance Expectations:
- **Small files (< 1MB)**: 10-30 seconds
- **Medium repositories**: 1-5 minutes
- **Large repositories**: 5-15 minutes

## Monitoring Real Data Flow

### Check Backend Logs:
```bash
# Docker
docker-compose logs -f backend

# Manual
tail -f apps/backend/logs/app.log
```

### Check Database Data:
```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d code_review_db

# Check tables
\dt

# View real data
SELECT * FROM analyses LIMIT 5;
SELECT * FROM findings LIMIT 5;
SELECT * FROM proposals LIMIT 5;
```

### Monitor API Calls:
```bash
# Check FastAPI docs with real endpoints
http://localhost:8000/docs

# Test specific endpoints
curl -X GET "http://localhost:8000/api/v1/analyses" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Success Criteria

✅ **Full Stack Working When:**
- [ ] User can register and login
- [ ] GitHub OAuth works
- [ ] Repository analysis completes successfully
- [ ] Real AI findings are generated
- [ ] WebSocket updates work in real-time
- [ ] Data persists in database
- [ ] Proposals can be applied/rejected
- [ ] Dashboard shows real analytics

## Common Real Data Issues

### API Rate Limits:
- OpenAI: 3 requests/minute (free tier)
- GitHub: 5000 requests/hour (authenticated)

### Large Repository Handling:
- Files > 1MB may timeout
- Repositories > 100MB may need chunking

### AI Analysis Quality:
- Better results with well-structured code
- May struggle with very domain-specific code
- Works best with common languages (Python, JS, TS, Java)

