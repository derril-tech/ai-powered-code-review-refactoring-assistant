import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
from loguru import logger

class EmailService:
    """Service for sending emails."""
    
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USERNAME
        self.smtp_password = settings.SMTP_PASSWORD
        self.smtp_tls = settings.SMTP_TLS
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: str = None
    ) -> bool:
        """Send an email."""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.smtp_username
            message["To"] = to_email
            
            # Add text and HTML parts
            if text_content:
                text_part = MIMEText(text_content, "plain")
                message.attach(text_part)
            
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            # Send email
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_username,
                password=self.smtp_password,
                use_tls=self.smtp_tls
            )
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False
    
    async def send_verification_email(self, email: str, user_id: int) -> bool:
        """Send email verification link."""
        subject = "Verify your email address"
        
        # In a real application, you would generate a verification token
        verification_url = f"https://yourdomain.com/verify-email?token={user_id}"
        
        html_content = f"""
        <html>
            <body>
                <h2>Welcome to AI-Powered Code Review Assistant!</h2>
                <p>Please click the link below to verify your email address:</p>
                <p><a href="{verification_url}">Verify Email</a></p>
                <p>If you didn't create an account, you can safely ignore this email.</p>
            </body>
        </html>
        """
        
        text_content = f"""
        Welcome to AI-Powered Code Review Assistant!
        
        Please click the link below to verify your email address:
        {verification_url}
        
        If you didn't create an account, you can safely ignore this email.
        """
        
        return await self.send_email(email, subject, html_content, text_content)
    
    async def send_password_reset_email(self, email: str, user_id: int) -> bool:
        """Send password reset link."""
        subject = "Reset your password"
        
        # In a real application, you would generate a reset token
        reset_url = f"https://yourdomain.com/reset-password?token={user_id}"
        
        html_content = f"""
        <html>
            <body>
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password. Click the link below to proceed:</p>
                <p><a href="{reset_url}">Reset Password</a></p>
                <p>If you didn't request this, you can safely ignore this email.</p>
                <p>This link will expire in 1 hour.</p>
            </body>
        </html>
        """
        
        text_content = f"""
        Password Reset Request
        
        You requested to reset your password. Click the link below to proceed:
        {reset_url}
        
        If you didn't request this, you can safely ignore this email.
        This link will expire in 1 hour.
        """
        
        return await self.send_email(email, subject, html_content, text_content)
    
    async def send_analysis_complete_email(self, email: str, analysis_id: int, repo_name: str) -> bool:
        """Send notification when analysis is complete."""
        subject = f"Code analysis complete for {repo_name}"
        
        analysis_url = f"https://yourdomain.com/analyses/{analysis_id}"
        
        html_content = f"""
        <html>
            <body>
                <h2>Code Analysis Complete</h2>
                <p>Your code analysis for <strong>{repo_name}</strong> has been completed.</p>
                <p><a href="{analysis_url}">View Results</a></p>
                <p>Thank you for using AI-Powered Code Review Assistant!</p>
            </body>
        </html>
        """
        
        text_content = f"""
        Code Analysis Complete
        
        Your code analysis for {repo_name} has been completed.
        View results: {analysis_url}
        
        Thank you for using AI-Powered Code Review Assistant!
        """
        
        return await self.send_email(email, subject, html_content, text_content)

# Global email service instance
email_service = EmailService()

# Convenience functions
async def send_verification_email(email: str, user_id: int) -> bool:
    """Send verification email."""
    return await email_service.send_verification_email(email, user_id)

async def send_password_reset_email(email: str, user_id: int) -> bool:
    """Send password reset email."""
    return await email_service.send_password_reset_email(email, user_id)

async def send_analysis_complete_email(email: str, analysis_id: int, repo_name: str) -> bool:
    """Send analysis complete notification."""
    return await email_service.send_analysis_complete_email(email, analysis_id, repo_name)
