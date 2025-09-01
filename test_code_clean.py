"""
Clean Python code following best practices
This file demonstrates proper coding standards and security practices
"""

import os
import sys
from typing import List, Optional
import sqlite3
from flask import Flask, request, escape
from dataclasses import dataclass


@dataclass
class DatabaseConfig:
    """Database configuration with secure password handling"""
    host: str
    port: int
    password: str  # Retrieved from environment variables in real app

    @classmethod
    def from_env(cls) -> 'DatabaseConfig':
        """Create config from environment variables"""
        return cls(
            host=os.getenv('DB_HOST', 'localhost'),
            port=int(os.getenv('DB_PORT', '5432')),
            password=os.getenv('DB_PASSWORD')
        )


class UserRepository:
    """Repository pattern for user data access"""

    def __init__(self, db_config: DatabaseConfig):
        self.db_config = db_config

    def find_user_by_username(self, username: str) -> Optional[dict]:
        """Secure user lookup with parameterized query"""
        # Validate input
        if not username or len(username) > 50:
            raise ValueError("Invalid username")

        with sqlite3.connect('users.db') as conn:
            cursor = conn.cursor()
            # Use parameterized query to prevent SQL injection
            cursor.execute(
                "SELECT id, username, email FROM users WHERE username = ?",
                (username,)
            )
            row = cursor.fetchone()

            if row:
                return {
                    'id': row[0],
                    'username': row[1],
                    'email': row[2]
                }
            return None


def calculate_sum_efficiently(numbers: List[int]) -> int:
    """Efficient sum calculation without memory overhead"""
    total = 0
    for number in numbers:
        total += number
    return total


@dataclass
class User:
    """User model with proper encapsulation"""
    username: str
    email: str

    @property
    def display_name(self) -> str:
        """Computed property for display name"""
        return self.username.title()

    def validate(self) -> bool:
        """Validate user data"""
        return (
            len(self.username) >= 3 and
            '@' in self.email and
            len(self.email) >= 5
        )


def handle_errors_gracefully(operation: str) -> str:
    """Proper error handling with specific exception types"""
    try:
        # Simulate operation
        if operation == "divide_by_zero":
            result = 1 / 0
        return f"Operation '{operation}' completed successfully"
    except ZeroDivisionError:
        return "Error: Division by zero occurred"
    except Exception as e:
        return f"Unexpected error: {str(e)}"


def create_config_paths() -> dict:
    """Cross-platform configuration paths"""
    home_dir = os.path.expanduser("~")
    config_dir = os.path.join(home_dir, '.myapp', 'config')
    log_dir = os.path.join(home_dir, '.myapp', 'logs')

    return {
        'config': os.path.join(config_dir, 'config.json'),
        'logs': os.path.join(log_dir, 'app.log')
    }


def create_secure_flask_app() -> Flask:
    """Flask app with security best practices"""
    app = Flask(__name__)

    @app.route('/greet/<name>')
    def greet_user(name: str):
        # Escape user input to prevent XSS
        safe_name = escape(name)
        return f"Hello, {safe_name}!"

    @app.route('/api/data')
    def get_data():
        # Validate and sanitize inputs
        limit = request.args.get('limit', '10', type=int)
        if limit < 1 or limit > 100:
            return {"error": "Limit must be between 1 and 100"}, 400

        return {"data": [f"item_{i}" for i in range(min(limit, 10))]}

    return app


def process_data_efficiently(data: List[str]) -> int:
    """
    Process data with single responsibility and proper documentation

    Args:
        data: List of strings to process

    Returns:
        Number of processed items
    """
    processed_count = 0

    for item in data:
        if item and len(item.strip()) > 0:
            # Process item (placeholder)
            processed_count += 1

    return processed_count


def simple_conditional_check(a: bool, b: bool, c: bool) -> bool:
    """Simple, readable conditional logic"""
    # Clear and readable conditions
    if a and b:
        return True
    elif c:
        return True
    else:
        return False


def shallow_nesting_example() -> str:
    """Function with proper nesting depth"""
    if validate_input():
        return "Valid input"
    else:
        return "Invalid input"


def validate_input() -> bool:
    """Separate function for input validation"""
    # Implementation would go here
    return True


def main():
    """Main entry point with proper structure"""
    print("Starting clean code example...")

    # Example usage
    repo = UserRepository(DatabaseConfig.from_env())
    user = repo.find_user_by_username("testuser")

    if user:
        print(f"Found user: {user['username']}")

    # Demonstrate other functions
    numbers = list(range(1, 1000))
    total = calculate_sum_efficiently(numbers)
    print(f"Sum of numbers: {total}")

    # Show error handling
    result = handle_errors_gracefully("normal_operation")
    print(result)

    print("Clean code example completed!")


if __name__ == "__main__":
    main()
