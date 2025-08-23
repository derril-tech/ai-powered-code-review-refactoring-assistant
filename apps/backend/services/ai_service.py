from typing import List, Dict, Any, Optional
import openai
import anthropic
from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI, ChatAnthropic
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.schema import HumanMessage, SystemMessage
from app.core.config import settings
from loguru import logger

class AIService:
    """Service for AI-powered code analysis and refactoring."""
    
    def __init__(self):
        self.openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.anthropic_client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        
        # Initialize LangChain models
        self.openai_llm = ChatOpenAI(
            model_name=settings.OPENAI_MODEL,
            temperature=settings.OPENAI_TEMPERATURE,
            max_tokens=settings.OPENAI_MAX_TOKENS,
            openai_api_key=settings.OPENAI_API_KEY
        )
        
        self.claude_llm = ChatAnthropic(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=settings.ANTHROPIC_MAX_TOKENS,
            anthropic_api_key=settings.ANTHROPIC_API_KEY
        )
    
    async def analyze_code(
        self, 
        code: str, 
        language: str, 
        analysis_type: str = "full",
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Analyze code for issues and improvements."""
        try:
            # Create analysis prompt
            prompt = self._create_analysis_prompt(code, language, analysis_type, context)
            
            # Use Claude for detailed analysis
            response = await self.claude_llm.agenerate([[HumanMessage(content=prompt)]])
            
            # Parse and structure the response
            analysis_result = self._parse_analysis_response(response.generations[0][0].text)
            
            return {
                "success": True,
                "findings": analysis_result.get("findings", []),
                "summary": analysis_result.get("summary", ""),
                "suggestions": analysis_result.get("suggestions", []),
                "model_used": settings.ANTHROPIC_MODEL
            }
            
        except Exception as e:
            logger.error(f"Code analysis failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "findings": [],
                "summary": "Analysis failed",
                "suggestions": []
            }
    
    async def refactor_code(
        self, 
        code: str, 
        language: str, 
        refactoring_type: str,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Refactor code based on specified improvements."""
        try:
            # Create refactoring prompt
            prompt = self._create_refactoring_prompt(code, language, refactoring_type, context)
            
            # Use GPT-4 for refactoring
            response = await self.openai_llm.agenerate([[HumanMessage(content=prompt)]])
            
            # Parse the refactored code
            refactored_code = self._parse_refactoring_response(response.generations[0][0].text)
            
            return {
                "success": True,
                "original_code": code,
                "refactored_code": refactored_code,
                "explanation": "Code has been refactored for better maintainability and performance",
                "model_used": settings.OPENAI_MODEL
            }
            
        except Exception as e:
            logger.error(f"Code refactoring failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "original_code": code,
                "refactored_code": code
            }
    
    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for text using OpenAI."""
        try:
            response = await self.openai_client.embeddings.create(
                model="text-embedding-ada-002",
                input=texts
            )
            
            return [embedding.embedding for embedding in response.data]
            
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            return []
    
    def _create_analysis_prompt(
        self, 
        code: str, 
        language: str, 
        analysis_type: str,
        context: Optional[str] = None
    ) -> str:
        """Create a prompt for code analysis."""
        base_prompt = f"""
You are an expert code reviewer and static analysis tool. Analyze the following {language} code for issues, improvements, and best practices.

Code to analyze:
```{language}
{code}
"""

        if context:
            base_prompt += f"\nContext: {context}\n"
        
        if analysis_type == "security":
            base_prompt += """
Focus specifically on:
- Security vulnerabilities (SQL injection, XSS, CSRF, etc.)
- Input validation issues
- Authentication and authorization problems
- Data exposure risks
- Cryptographic weaknesses
"""
        elif analysis_type == "performance":
            base_prompt += """
Focus specifically on:
- Performance bottlenecks
- Memory leaks
- Inefficient algorithms
- Database query optimization
- Resource usage patterns
"""
        elif analysis_type == "style":
            base_prompt += """
Focus specifically on:
- Code style and formatting
- Naming conventions
- Code organization
- Documentation quality
- Readability improvements
"""
        else:  # full analysis
            base_prompt += """
Provide a comprehensive analysis covering:
- Security vulnerabilities
- Performance issues
- Code quality and maintainability
- Best practices violations
- Potential bugs
- Style and formatting issues
- Documentation needs
"""

        base_prompt += """
Please provide your analysis in the following JSON format:
{
    "findings": [
        {
            "title": "Issue title",
            "description": "Detailed description",
            "severity": "critical|high|medium|low",
            "type": "security|performance|bug|code_smell|refactoring|style|documentation",
            "line_number": 123,
            "suggested_fix": "How to fix this issue",
            "confidence": 0.95
        }
    ],
    "summary": "Overall assessment of the code",
    "suggestions": ["General improvement suggestions"]
}
"""

        return base_prompt
    
    def _create_refactoring_prompt(
        self, 
        code: str, 
        language: str, 
        refactoring_type: str,
        context: Optional[str] = None
    ) -> str:
        """Create a prompt for code refactoring."""
        prompt = f"""
You are an expert software engineer specializing in code refactoring. Refactor the following {language} code to improve its quality, maintainability, and performance.

Original code:
```{language}
{code}
"""

        if context:
            prompt += f"\nContext: {context}\n"
        
        prompt += f"""
Refactoring type: {refactoring_type}

Please provide the refactored code in a clean, well-formatted manner. Include comments explaining the key changes made.

Return only the refactored code without additional explanations.
"""

        return prompt
    
    def _parse_analysis_response(self, response: str) -> Dict[str, Any]:
        """Parse the AI analysis response."""
        try:
            # Try to extract JSON from the response
            import json
            import re
            
            # Find JSON in the response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            
            # Fallback: return structured response
            return {
                "findings": [],
                "summary": response,
                "suggestions": []
            }
            
        except Exception as e:
            logger.error(f"Failed to parse analysis response: {e}")
            return {
                "findings": [],
                "summary": response,
                "suggestions": []
            }
    
    def _parse_refactoring_response(self, response: str) -> str:
        """Parse the refactoring response to extract code."""
        # Extract code blocks from the response
        import re
        
        code_blocks = re.findall(r'```\w*\n(.*?)\n```', response, re.DOTALL)
        if code_blocks:
            return code_blocks[0].strip()
        
        return response.strip()

# Global AI service instance
ai_service = AIService()
