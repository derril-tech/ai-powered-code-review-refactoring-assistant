"""
Security middleware for production deployment.
Implements rate limiting, security headers, and request validation.
"""

import time
import json
import hashlib
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from ipaddress import ip_address, ip_network
import re

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import redis
import logging

from ..core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""
    
    def __init__(self, app, security_headers: Optional[Dict[str, str]] = None):
        super().__init__(app)
        self.security_headers = security_headers or {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": (
                "geolocation=(), microphone=(), camera=(), "
                "fullscreen=(), payment=(), usb=()"
            )
        }
        
        # Add HSTS header for HTTPS
        if getattr(settings, 'FORCE_HTTPS', False):
            self.security_headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Add security headers
        for header, value in self.security_headers.items():
            response.headers[header] = value
        
        # Add CSP header
        if hasattr(settings, 'SECURITY_HEADERS'):
            csp = settings.SECURITY_HEADERS.get("Content-Security-Policy")
            if csp:
                response.headers["Content-Security-Policy"] = csp
        
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware using Redis."""
    
    def __init__(
        self, 
        app, 
        redis_client: Optional[redis.Redis] = None,
        requests_per_minute: int = 60,
        requests_per_hour: int = 1000,
        requests_per_day: int = 10000,
        burst_limit: int = 10,
        exempt_paths: Optional[List[str]] = None,
        exempt_ips: Optional[List[str]] = None
    ):
        super().__init__(app)
        self.redis_client = redis_client
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour
        self.requests_per_day = requests_per_day
        self.burst_limit = burst_limit
        self.exempt_paths = exempt_paths or ["/health", "/metrics", "/docs", "/redoc"]
        self.exempt_ips = exempt_ips or []
        
        # Compile exempt paths regex
        self.exempt_patterns = [re.compile(path) for path in self.exempt_paths]
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address from request."""
        # Check X-Forwarded-For header (from load balancer)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # Take the first IP in case of multiple proxies
            return forwarded_for.split(",")[0].strip()
        
        # Check X-Real-IP header
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip.strip()
        
        # Fall back to client host
        return request.client.host if request.client else "unknown"
    
    def _is_exempt_path(self, path: str) -> bool:
        """Check if path is exempt from rate limiting."""
        return any(pattern.match(path) for pattern in self.exempt_patterns)
    
    def _is_exempt_ip(self, ip: str) -> bool:
        """Check if IP is exempt from rate limiting."""
        try:
            client_ip = ip_address(ip)
            for exempt_ip in self.exempt_ips:
                if "/" in exempt_ip:  # CIDR notation
                    if client_ip in ip_network(exempt_ip, strict=False):
                        return True
                else:  # Single IP
                    if str(client_ip) == exempt_ip:
                        return True
        except ValueError:
            logger.warning(f"Invalid IP address: {ip}")
        
        return False
    
    def _get_rate_limit_key(self, ip: str, window: str) -> str:
        """Generate Redis key for rate limiting."""
        return f"rate_limit:{ip}:{window}"
    
    async def _check_rate_limit(self, ip: str) -> Tuple[bool, Dict[str, int]]:
        """Check if request should be rate limited."""
        if not self.redis_client:
            return True, {}  # Allow if no Redis
        
        current_time = int(time.time())
        
        # Define time windows
        windows = {
            "minute": (60, self.requests_per_minute, current_time // 60),
            "hour": (3600, self.requests_per_hour, current_time // 3600),
            "day": (86400, self.requests_per_day, current_time // 86400),
        }
        
        pipe = self.redis_client.pipeline()
        results = {}
        
        for window_name, (duration, limit, window_start) in windows.items():
            key = f"rate_limit:{ip}:{window_name}:{window_start}"
            
            # Get current count
            pipe.get(key)
        
        # Execute pipeline
        counts = pipe.execute()
        
        # Check limits
        for i, (window_name, (duration, limit, window_start)) in enumerate(windows.items()):
            current_count = int(counts[i] or 0)
            results[f"{window_name}_count"] = current_count
            results[f"{window_name}_limit"] = limit
            results[f"{window_name}_remaining"] = max(0, limit - current_count)
            
            if current_count >= limit:
                return False, results
        
        # Increment counters
        pipe = self.redis_client.pipeline()
        for window_name, (duration, limit, window_start) in windows.items():
            key = f"rate_limit:{ip}:{window_name}:{window_start}"
            pipe.incr(key)
            pipe.expire(key, duration)
        
        pipe.execute()
        
        # Update counts in results
        for window_name in windows:
            results[f"{window_name}_count"] += 1
            results[f"{window_name}_remaining"] -= 1
        
        return True, results
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for exempt paths
        if self._is_exempt_path(request.url.path):
            return await call_next(request)
        
        # Get client IP
        client_ip = self._get_client_ip(request)
        
        # Skip rate limiting for exempt IPs
        if self._is_exempt_ip(client_ip):
            return await call_next(request)
        
        # Check rate limit
        allowed, limits = await self._check_rate_limit(client_ip)
        
        if not allowed:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "Rate limit exceeded",
                    "message": "Too many requests. Please try again later.",
                    "limits": limits
                },
                headers={
                    "X-RateLimit-Limit-Minute": str(self.requests_per_minute),
                    "X-RateLimit-Limit-Hour": str(self.requests_per_hour),
                    "X-RateLimit-Limit-Day": str(self.requests_per_day),
                    "X-RateLimit-Remaining-Minute": str(limits.get("minute_remaining", 0)),
                    "X-RateLimit-Remaining-Hour": str(limits.get("hour_remaining", 0)),
                    "X-RateLimit-Remaining-Day": str(limits.get("day_remaining", 0)),
                    "Retry-After": "60"  # Suggest retry after 1 minute
                }
            )
        
        # Add rate limit headers to response
        response = await call_next(request)
        response.headers["X-RateLimit-Limit-Minute"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Limit-Hour"] = str(self.requests_per_hour)
        response.headers["X-RateLimit-Limit-Day"] = str(self.requests_per_day)
        response.headers["X-RateLimit-Remaining-Minute"] = str(limits.get("minute_remaining", 0))
        response.headers["X-RateLimit-Remaining-Hour"] = str(limits.get("hour_remaining", 0))
        response.headers["X-RateLimit-Remaining-Day"] = str(limits.get("day_remaining", 0))
        
        return response


class RequestValidationMiddleware(BaseHTTPMiddleware):
    """Validate and sanitize incoming requests."""
    
    def __init__(
        self, 
        app,
        max_request_size: int = 10 * 1024 * 1024,  # 10MB
        blocked_user_agents: Optional[List[str]] = None,
        blocked_referers: Optional[List[str]] = None
    ):
        super().__init__(app)
        self.max_request_size = max_request_size
        self.blocked_user_agents = blocked_user_agents or [
            r".*bot.*", r".*crawler.*", r".*spider.*", 
            r".*scraper.*", r".*scanner.*"
        ]
        self.blocked_referers = blocked_referers or []
        
        # Compile regex patterns
        self.ua_patterns = [re.compile(ua, re.IGNORECASE) for ua in self.blocked_user_agents]
        self.referer_patterns = [re.compile(ref, re.IGNORECASE) for ref in self.blocked_referers]
    
    def _is_blocked_user_agent(self, user_agent: str) -> bool:
        """Check if user agent is blocked."""
        if not user_agent:
            return False
        
        return any(pattern.search(user_agent) for pattern in self.ua_patterns)
    
    def _is_blocked_referer(self, referer: str) -> bool:
        """Check if referer is blocked."""
        if not referer:
            return False
        
        return any(pattern.search(referer) for referer in self.referer_patterns)
    
    async def dispatch(self, request: Request, call_next):
        # Check content length
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > self.max_request_size:
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={
                    "error": "Request too large",
                    "message": f"Request size exceeds {self.max_request_size} bytes"
                }
            )
        
        # Check user agent
        user_agent = request.headers.get("user-agent", "")
        if self._is_blocked_user_agent(user_agent):
            logger.warning(f"Blocked user agent: {user_agent}")
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={
                    "error": "Forbidden",
                    "message": "Access denied"
                }
            )
        
        # Check referer
        referer = request.headers.get("referer", "")
        if self._is_blocked_referer(referer):
            logger.warning(f"Blocked referer: {referer}")
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={
                    "error": "Forbidden",
                    "message": "Access denied"
                }
            )
        
        return await call_next(request)


class HTTPSRedirectMiddleware(BaseHTTPMiddleware):
    """Redirect HTTP requests to HTTPS in production."""
    
    def __init__(self, app, force_https: bool = True):
        super().__init__(app)
        self.force_https = force_https
    
    async def dispatch(self, request: Request, call_next):
        if (
            self.force_https and 
            request.headers.get("x-forwarded-proto") != "https" and
            request.url.scheme != "https"
        ):
            # Redirect to HTTPS
            https_url = request.url.replace(scheme="https")
            return JSONResponse(
                status_code=status.HTTP_301_MOVED_PERMANENTLY,
                headers={"Location": str(https_url)}
            )
        
        return await call_next(request)


class SecurityAuditMiddleware(BaseHTTPMiddleware):
    """Log security-relevant events for auditing."""
    
    def __init__(self, app):
        super().__init__(app)
        self.security_logger = logging.getLogger("security_audit")
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        client_ip = request.headers.get("X-Forwarded-For", 
                                       request.headers.get("X-Real-IP", 
                                                         request.client.host if request.client else "unknown"))
        
        # Log security-relevant requests
        if self._is_security_relevant(request):
            self.security_logger.info(
                f"Security event: {request.method} {request.url.path} "
                f"from {client_ip} UA: {request.headers.get('user-agent', 'unknown')}"
            )
        
        try:
            response = await call_next(request)
            
            # Log failed authentication attempts
            if response.status_code == 401:
                self.security_logger.warning(
                    f"Authentication failed: {request.method} {request.url.path} "
                    f"from {client_ip}"
                )
            
            # Log access to sensitive endpoints
            if response.status_code == 200 and self._is_sensitive_endpoint(request.url.path):
                self.security_logger.info(
                    f"Sensitive access: {request.method} {request.url.path} "
                    f"from {client_ip} - Success"
                )
            
            return response
            
        except Exception as e:
            self.security_logger.error(
                f"Request error: {request.method} {request.url.path} "
                f"from {client_ip} - {str(e)}"
            )
            raise
    
    def _is_security_relevant(self, request: Request) -> bool:
        """Check if request is security-relevant."""
        security_paths = [
            "/api/v1/auth/", "/api/v1/users/", "/api/v1/admin/",
            "/api/v1/webhooks/", "/api/v1/organizations/"
        ]
        return any(request.url.path.startswith(path) for path in security_paths)
    
    def _is_sensitive_endpoint(self, path: str) -> bool:
        """Check if endpoint is sensitive."""
        sensitive_paths = [
            "/api/v1/users/me", "/api/v1/organizations/", 
            "/api/v1/admin/", "/api/v1/stats/"
        ]
        return any(path.startswith(sensitive_path) for sensitive_path in sensitive_paths)