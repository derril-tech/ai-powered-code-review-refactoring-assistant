#!/usr/bin/env python3
"""
Simple connection test that only requires basic libraries
"""

import os
from urllib.parse import urlparse

def test_env_file():
    """Check if .env file exists and has the right variables"""
    print("🔍 Checking environment configuration...")
    
    # Try to load .env file
    try:
        from dotenv import load_dotenv
        load_dotenv()
        print("✅ .env file loaded successfully")
    except ImportError:
        print("⚠️  python-dotenv not installed, checking environment variables directly")
    except Exception as e:
        print(f"❌ Error loading .env: {e}")
        return False
    
    # Check required variables
    required_vars = [
        "DATABASE_URL",
        "REDIS_URL", 
        "UPSTASH_REDIS_REST_URL",
        "UPSTASH_REDIS_REST_TOKEN",
        "SECRET_KEY"
    ]
    
    missing_vars = []
    for var in required_vars:
        value = os.getenv(var)
        if not value or value == f"your-{var.lower().replace('_', '-')}-here":
            missing_vars.append(var)
        else:
            print(f"✅ {var}: {'*' * 20}...{value[-10:]}")
    
    if missing_vars:
        print(f"❌ Missing variables: {', '.join(missing_vars)}")
        return False
    
    return True

def test_database_url():
    """Test if database URL is properly formatted"""
    print("\n🔍 Testing database URL format...")
    
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ DATABASE_URL not found")
        return False
    
    try:
        parsed = urlparse(db_url)
        print(f"✅ Database host: {parsed.hostname}")
        print(f"✅ Database port: {parsed.port}")
        print(f"✅ Database name: {parsed.path[1:]}")  # Remove leading /
        print(f"✅ Database user: {parsed.username}")
        return True
    except Exception as e:
        print(f"❌ Invalid database URL: {e}")
        return False

def test_redis_url():
    """Test if Redis URL is properly formatted"""
    print("\n🔍 Testing Redis URL format...")
    
    redis_url = os.getenv("REDIS_URL")
    if not redis_url:
        print("❌ REDIS_URL not found")
        return False
    
    try:
        parsed = urlparse(redis_url)
        print(f"✅ Redis host: {parsed.hostname}")
        print(f"✅ Redis port: {parsed.port}")
        return True
    except Exception as e:
        print(f"❌ Invalid Redis URL: {e}")
        return False

def main():
    """Run all basic tests"""
    print("🚀 RefactorIQ Backend - Basic Configuration Test")
    print("=" * 60)
    
    # Test environment
    env_ok = test_env_file()
    
    if not env_ok:
        print("\n❌ Environment configuration failed!")
        print("\n📋 Next steps:")
        print("1. Make sure you copied example.env to .env")
        print("2. Check that all variables are set correctly")
        return False
    
    # Test URLs
    db_ok = test_database_url()
    redis_ok = test_redis_url()
    
    print("\n" + "=" * 60)
    print("📊 Configuration Test Results:")
    print(f"   Environment file: {'✅ OK' if env_ok else '❌ FAILED'}")
    print(f"   Database URL:     {'✅ OK' if db_ok else '❌ FAILED'}")
    print(f"   Redis URL:        {'✅ OK' if redis_ok else '❌ FAILED'}")
    
    if env_ok and db_ok and redis_ok:
        print("\n🎉 Configuration looks good!")
        print("\n📋 Next steps:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Run full connection test: python test_connections.py")
        print("3. Deploy to Fly.io")
        return True
    else:
        print("\n⚠️  Configuration issues found. Please fix them first.")
        return False

if __name__ == "__main__":
    main()

