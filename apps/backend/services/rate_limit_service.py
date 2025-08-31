"""
Rate limiting service for webhook endpoints.

This service provides rate limiting functionality to prevent abuse
of webhook endpoints and protect against DoS attacks.
"""

import redis.asyncio as redis
from typing import Optional
from app.core.config import settings
from loguru import logger
import hashlib
import time


class RateLimitService:
    """Service for rate limiting webhook requests."""
    
    def __init__(self):
        self.redis_client = None
        self._initialize_redis()
    
    def _initialize_redis(self):
        """Initialize Redis connection for rate limiting."""
        try:
            self.redis_client = redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True
            )
        except Exception as e:
            logger.error(f"Failed to initialize Redis for rate limiting: {e}")
            self.redis_client = None
    
    async def check_rate_limit(
        self,
        identifier: str,
        limit: int = 10,
        window: int = 3600,  # 1 hour in seconds
        cost: int = 1
    ) -> tuple[bool, dict]:
        """
        Check if request is within rate limit.
        
        Args:
            identifier: Unique identifier for rate limiting (e.g., repo URL, IP)
            limit: Maximum number of requests allowed
            window: Time window in seconds
            cost: Cost of this request (default 1)
        
        Returns:
            Tuple of (is_allowed, rate_limit_info)
        """
        if not self.redis_client:
            logger.warning("Redis not available, allowing request")
            return True, {}
        
        try:
            # Create unique key for this identifier
            key = f"rate_limit:webhook:{hashlib.sha256(identifier.encode()).hexdigest()}"
            current_time = int(time.time())
            window_start = current_time - window
            
            # Use Redis sorted set for sliding window
            async with self.redis_client.pipeline() as pipe:
                # Remove expired entries
                await pipe.zremrangebyscore(key, 0, window_start)
                
                # Count current requests in window
                await pipe.zcard(key)
                
                # Add current request
                await pipe.zadd(key, {str(current_time): current_time})
                
                # Set expiration on key
                await pipe.expire(key, window)
                
                results = await pipe.execute()
            
            current_count = results[1] if len(results) > 1 else 0
            
            # Check if limit exceeded
            is_allowed = current_count < limit
            
            rate_limit_info = {
                "limit": limit,
                "remaining": max(0, limit - current_count - cost),
                "reset_time": current_time + window,
                "window": window
            }
            
            if not is_allowed:
                logger.warning(f"Rate limit exceeded for {identifier}: {current_count}/{limit}")
            
            return is_allowed, rate_limit_info
            
        except Exception as e:
            logger.error(f"Error checking rate limit: {e}")
            # On error, allow the request to prevent blocking legitimate traffic
            return True, {}
    
    async def get_rate_limit_info(self, identifier: str) -> dict:
        """Get current rate limit status for identifier."""
        if not self.redis_client:
            return {}
        
        try:
            key = f"rate_limit:webhook:{hashlib.sha256(identifier.encode()).hexdigest()}"
            current_time = int(time.time())
            window = 3600  # Default 1 hour window
            
            # Get current count
            count = await self.redis_client.zcard(key)
            
            return {
                "current_count": count,
                "limit": 10,  # Default limit
                "window": window,
                "reset_time": current_time + window
            }
            
        except Exception as e:
            logger.error(f"Error getting rate limit info: {e}")
            return {}


# Global rate limit service instance
rate_limit_service = RateLimitService()