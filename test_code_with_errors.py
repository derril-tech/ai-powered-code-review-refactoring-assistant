# Sample Python file with various code issues for testing AI analysis
# This file contains intentional errors, security issues, and bad practices

import os
import sys
import sqlite3
from flask import Flask, request, render_template_string

# Security vulnerability: Hardcoded password
DB_PASSWORD = "admin123"
API_KEY = "sk-1234567890abcdef"  # Exposed API key

# Global variable usage (bad practice)
global_counter = 0

def insecure_sql_query(user_input):
    """Security vulnerability: SQL injection"""
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()

    # DANGEROUS: Direct string interpolation in SQL
    query = f"SELECT * FROM users WHERE username = '{user_input}'"
    cursor.execute(query)

    return cursor.fetchall()

def memory_leak_example():
    """Performance issue: Memory leak"""
    large_list = []
    for i in range(1000000):  # Creates huge list unnecessarily
        large_list.append(i * 2)
    return sum(large_list)

def unused_variables():
    """Code quality: Unused variables and imports"""
    unused_var = "This is never used"
    another_unused = 42
    third_unused = [1, 2, 3]

    # Only use one of the variables
    return unused_var + str(another_unused)

def poor_error_handling():
    """Bad practice: Poor error handling"""
    try:
        result = 1 / 0  # Will cause ZeroDivisionError
    except:
        # Too broad exception handling
        pass  # Silent failure - very bad practice

    return "This will never execute"

class BadClassDesign:
    """Code quality: Poor class design"""

    def __init__(self):
        self.value = None

    def set_value(self, val):
        self.value = val

    def get_value(self):
        return self.value

    # Redundant methods - could just use property
    def get_value_upper(self):
        return str(self.value).upper()

    def get_value_lower(self):
        return str(self.value).lower()

def infinite_loop_risk(n):
    """Performance: Potential infinite loop"""
    while n > 0:
        if n == 1:
            break
        n = n - 1  # This could cause infinite loop if n is float

def hardcoded_paths():
    """Portability issue: Hardcoded paths"""
    config_file = "C:\\Users\\Admin\\config.txt"  # Windows-specific path
    log_file = "/var/log/app.log"  # Unix-specific path

    return config_file, log_file

def flask_vulnerability():
    """Security: Flask SSTI vulnerability"""
    app = Flask(__name__)

    @app.route('/template')
    def template_page():
        user_template = request.args.get('template', 'Hello World')

        # DANGEROUS: Server-side template injection
        return render_template_string(user_template)

    return app

# Global code execution (bad practice)
print("This file has many issues!")
result = insecure_sql_query("admin'; DROP TABLE users; --")
print(f"Result: {result}")

# Unused function
def completely_unused_function():
    """This function is never called"""
    return "I'm never used"

# Magic numbers (bad practice)
if len(sys.argv) > 7:  # Magic number 7
    print("Too many arguments")

# Poor naming conventions
def fn():  # Too short, unclear name
    return 42

# Inconsistent naming
camelCaseVar = "camel case"
snake_case_var = "snake case"
MixedCase = "mixed case"

# Long function with multiple responsibilities
def monolithic_function(data):
    """Does too many things - violates single responsibility principle"""
    # Process data
    processed = []
    for item in data:
        processed.append(item.upper())

    # Write to file
    with open('output.txt', 'w') as f:
        f.write('\n'.join(processed))

    # Send to API (pretend)
    print("Sending to API:", processed)

    # Return result
    return len(processed)

# Missing documentation
def undocumented_function(x, y):
    return x + y

# Overly complex conditional
def complex_conditional(a, b, c, d, e):
    if a and b or c and d or e and (a or b) and not (c and d):
        return True
    elif not a and b and c or d and not e:
        return False
    else:
        return None

# Deep nesting (hard to read)
def deeply_nested():
    if True:
        if True:
            if True:
                if True:
                    return "Too deep nesting!"

if __name__ == "__main__":
    print("Running test code with errors...")
    memory_leak_example()
    poor_error_handling()
    print("Done!")
