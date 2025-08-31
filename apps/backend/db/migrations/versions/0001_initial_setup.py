"""Initial database setup

Revision ID: 0001
Revises: 
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """Create all tables for RefactorIQ application."""
    
    # Enable UUID extension
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('username', sa.String(100), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=True),
        sa.Column('avatar_url', sa.String(500), nullable=True),
        sa.Column('preferred_language', sa.String(10), nullable=True, default='python'),
        sa.Column('timezone', sa.String(50), nullable=True, default='UTC'),
        sa.Column('notification_email', sa.Boolean(), nullable=False, default=True),
        sa.Column('notification_webhook', sa.String(500), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('is_verified', sa.Boolean(), nullable=False, default=False),
        sa.Column('is_premium', sa.Boolean(), nullable=False, default=False),
        sa.Column('github_id', sa.String(100), nullable=True),
        sa.Column('gitlab_id', sa.String(100), nullable=True),
        sa.Column('api_key', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('last_login', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('username'),
        sa.UniqueConstraint('api_key')
    )
    
    # Create organizations table
    op.create_table(
        'organizations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('slug', sa.String(100), nullable=False),
        sa.Column('avatar_url', sa.String(500), nullable=True),
        sa.Column('website_url', sa.String(500), nullable=True),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.Column('subscription_plan', sa.String(50), nullable=False, default='free'),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('settings', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug')
    )
    
    # Create organization_members table
    op.create_table(
        'organization_members',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('organization_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(50), nullable=False, default='member'),
        sa.Column('permissions', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('joined_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('invited_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['invited_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'user_id')
    )
    
    # Create repositories table
    op.create_table(
        'repositories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(500), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('url', sa.String(500), nullable=False),
        sa.Column('clone_url', sa.String(500), nullable=False),
        sa.Column('ssh_url', sa.String(500), nullable=True),
        sa.Column('default_branch', sa.String(100), nullable=False, default='main'),
        sa.Column('language', sa.String(50), nullable=True),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.Column('organization_id', sa.Integer(), nullable=True),
        sa.Column('is_private', sa.Boolean(), nullable=False, default=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('github_id', sa.String(100), nullable=True),
        sa.Column('gitlab_id', sa.String(100), nullable=True),
        sa.Column('webhook_secret', sa.String(255), nullable=True),
        sa.Column('auto_analysis', sa.Boolean(), nullable=False, default=False),
        sa.Column('analysis_config', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('last_analyzed', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('full_name', 'owner_id'),
        sa.UniqueConstraint('github_id'),
        sa.UniqueConstraint('gitlab_id')
    )
    
    # Create analyses table
    op.create_table(
        'analyses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('repository_id', sa.Integer(), nullable=True),
        sa.Column('repo_url', sa.String(500), nullable=True),
        sa.Column('branch', sa.String(100), nullable=True),
        sa.Column('commit_sha', sa.String(100), nullable=True),
        sa.Column('language', sa.String(50), nullable=True),
        sa.Column('analysis_type', sa.String(50), nullable=False, default='full'),
        sa.Column('status', sa.String(50), nullable=False, default='pending'),
        sa.Column('progress', sa.Integer(), nullable=False, default=0),
        sa.Column('summary', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('custom_rules', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('ai_model_used', sa.String(100), nullable=True),
        sa.Column('processing_time', sa.Integer(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['repository_id'], ['repositories.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create findings table
    op.create_table(
        'findings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('analysis_id', sa.Integer(), nullable=False),
        sa.Column('file_path', sa.String(1000), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('severity', sa.String(20), nullable=False),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column('line_number', sa.Integer(), nullable=True),
        sa.Column('column_number', sa.Integer(), nullable=True),
        sa.Column('end_line_number', sa.Integer(), nullable=True),
        sa.Column('end_column_number', sa.Integer(), nullable=True),
        sa.Column('code_snippet', sa.Text(), nullable=True),
        sa.Column('suggested_fix', sa.Text(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=False, default=0.5),
        sa.Column('is_false_positive', sa.Boolean(), nullable=False, default=False),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['analysis_id'], ['analyses.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create proposals table
    op.create_table(
        'proposals',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('finding_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('proposal_type', sa.String(50), nullable=False),
        sa.Column('patch_diff', sa.Text(), nullable=False),
        sa.Column('test_patch_diff', sa.Text(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=False),
        sa.Column('estimated_impact', sa.String(50), nullable=True),
        sa.Column('risk_score', sa.Float(), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, default='pending'),
        sa.Column('applied_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('applied_by', sa.Integer(), nullable=True),
        sa.Column('pr_url', sa.String(500), nullable=True),
        sa.Column('pr_number', sa.Integer(), nullable=True),
        sa.Column('commit_sha', sa.String(100), nullable=True),
        sa.Column('ai_model_used', sa.String(100), nullable=True),
        sa.Column('processing_time', sa.Integer(), nullable=True),
        sa.Column('tags', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('validation_errors', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('application_log', sa.Text(), nullable=True),
        sa.Column('rollback_info', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['finding_id'], ['findings.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['applied_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create events table for audit logging
    op.create_table(
        'events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('organization_id', sa.Integer(), nullable=True),
        sa.Column('event_type', sa.String(100), nullable=False),
        sa.Column('resource_type', sa.String(100), nullable=False),
        sa.Column('resource_id', sa.Integer(), nullable=True),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('details', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for performance
    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index('idx_users_username', 'users', ['username'])
    op.create_index('idx_users_github_id', 'users', ['github_id'])
    op.create_index('idx_users_gitlab_id', 'users', ['gitlab_id'])
    op.create_index('idx_users_created_at', 'users', ['created_at'])
    
    op.create_index('idx_organizations_slug', 'organizations', ['slug'])
    op.create_index('idx_organizations_owner_id', 'organizations', ['owner_id'])
    
    op.create_index('idx_organization_members_org_user', 'organization_members', ['organization_id', 'user_id'])
    op.create_index('idx_organization_members_role', 'organization_members', ['role'])
    
    op.create_index('idx_repositories_owner_id', 'repositories', ['owner_id'])
    op.create_index('idx_repositories_organization_id', 'repositories', ['organization_id'])
    op.create_index('idx_repositories_language', 'repositories', ['language'])
    op.create_index('idx_repositories_github_id', 'repositories', ['github_id'])
    op.create_index('idx_repositories_gitlab_id', 'repositories', ['gitlab_id'])
    
    op.create_index('idx_analyses_user_id', 'analyses', ['user_id'])
    op.create_index('idx_analyses_repository_id', 'analyses', ['repository_id'])
    op.create_index('idx_analyses_status', 'analyses', ['status'])
    op.create_index('idx_analyses_language', 'analyses', ['language'])
    op.create_index('idx_analyses_created_at', 'analyses', ['created_at'])
    op.create_index('idx_analyses_user_status', 'analyses', ['user_id', 'status'])
    
    op.create_index('idx_findings_analysis_id', 'findings', ['analysis_id'])
    op.create_index('idx_findings_severity', 'findings', ['severity'])
    op.create_index('idx_findings_type', 'findings', ['type'])
    op.create_index('idx_findings_file_path', 'findings', ['file_path'])
    op.create_index('idx_findings_line_number', 'findings', ['line_number'])
    
    op.create_index('idx_proposals_finding_id', 'proposals', ['finding_id'])
    op.create_index('idx_proposals_status', 'proposals', ['status'])
    op.create_index('idx_proposals_type', 'proposals', ['proposal_type'])
    op.create_index('idx_proposals_applied_by', 'proposals', ['applied_by'])
    op.create_index('idx_proposals_created_at', 'proposals', ['created_at'])
    
    op.create_index('idx_events_user_id', 'events', ['user_id'])
    op.create_index('idx_events_organization_id', 'events', ['organization_id'])
    op.create_index('idx_events_type', 'events', ['event_type'])
    op.create_index('idx_events_resource', 'events', ['resource_type', 'resource_id'])
    op.create_index('idx_events_created_at', 'events', ['created_at'])


def downgrade():
    """Drop all tables."""
    op.drop_table('events')
    op.drop_table('proposals')
    op.drop_table('findings')
    op.drop_table('analyses')
    op.drop_table('repositories')
    op.drop_table('organization_members')
    op.drop_table('organizations')
    op.drop_table('users')