#!/usr/bin/env python3
"""
Test script to verify Supabase and Upstash connections
Run this to make sure your credentials are working
"""

import asyncio
import asyncpg
import redis
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_database():
    """Test Supabase PostgreSQL connection"""
    print("🔍 Testing Supabase PostgreSQL connection...")
    
    try:
        # Extract connection details from DATABASE_URL
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            print("❌ DATABASE_URL not found in environment")
            return False
            
        # Convert asyncpg URL to regular postgres URL for testing
        db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")
        
        # Connect to database
        conn = await asyncpg.connect(db_url)
        
        # Test basic query
        result = await conn.fetchval("SELECT version()")
        print(f"✅ Database connected successfully!")
        print(f"   PostgreSQL version: {result[:50]}...")
        
        # Test pgvector extension
        try:
            await conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
            print("✅ pgvector extension is available")
        except Exception as e:
            print(f"⚠️  pgvector extension issue: {e}")
        
        await conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_redis():
    """Test Upstash Redis connection"""
    print("\n🔍 Testing Upstash Redis connection...")
    
    try:
        redis_url = os.getenv("REDIS_URL")
        if not redis_url:
            print("❌ REDIS_URL not found in environment")
            return False
            
        # Connect to Redis
        r = redis.from_url(redis_url)
        
        # Test ping
        result = r.ping()
        print(f"✅ Redis connected successfully! Ping: {result}")
        
        # Test set/get
        r.set("test_key", "RefactorIQ_test")
        value = r.get("test_key")
        print(f"✅ Redis read/write test: {value.decode()}")
        
        # Clean up
        r.delete("test_key")
        
        return True
        
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        return False

def test_upstash_rest():
    """Test Upstash REST API"""
    print("\n🔍 Testing Upstash REST API...")
    
    try:
        import requests
        
        rest_url = os.getenv("UPSTASH_REDIS_REST_URL")
        rest_token = os.getenv("UPSTASH_REDIS_REST_TOKEN")
        
        if not rest_url or not rest_token:
            print("❌ Upstash REST credentials not found")
            return False
            
        # Test REST API
        headers = {"Authorization": f"Bearer {rest_token}"}
        response = requests.post(
            f"{rest_url}/ping",
            headers=headers
        )
        
        if response.status_code == 200:
            print("✅ Upstash REST API connected successfully!")
            return True
        else:
            print(f"❌ Upstash REST API failed: {response.status_code}")
            return False
            
    except ImportError:
        print("⚠️  requests library not installed, skipping REST test")
        return True
    except Exception as e:
        print(f"❌ Upstash REST API failed: {e}")
        return False

async def main():
    """Run all connection tests"""
    print("🚀 RefactorIQ Backend Connection Tests")
    print("=" * 50)
    
    # Test database
    db_ok = await test_database()
    
    # Test Redis
    redis_ok = test_redis()
    
    # Test Upstash REST
    rest_ok = test_upstash_rest()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"   Database (Supabase): {'✅ OK' if db_ok else '❌ FAILED'}")
    print(f"   Redis (Upstash):     {'✅ OK' if redis_ok else '❌ FAILED'}")
    print(f"   REST API (Upstash):  {'✅ OK' if rest_ok else '❌ FAILED'}")
    
    if db_ok and redis_ok:
        print("\n🎉 All connections successful! Ready for deployment.")
        return True
    else:
        print("\n⚠️  Some connections failed. Check your credentials.")
        return False

if __name__ == "__main__":
    asyncio.run(main())
