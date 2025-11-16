"""Add whitelabel_instances table

This migration adds the whitelabel_instances table for managing
white-label OV-Panel instances with full isolation.

Revision ID: add_whitelabel_instances
Revises: health_sync_fields
Create Date: 2025-11-16
"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime


# revision identifiers, used by Alembic.
revision = 'add_whitelabel_instances'
down_revision = 'health_sync_fields'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'whitelabel_instances',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('instance_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('port', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, server_default='stopped'),
        sa.Column('admin_username', sa.String(), nullable=False),
        sa.Column('admin_password_hash', sa.String(), nullable=False),
        sa.Column('jwt_secret', sa.String(), nullable=False),
        sa.Column('api_key', sa.String(), nullable=True),
        sa.Column('has_openvpn', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_whitelabel_instances_id'), 'whitelabel_instances', ['id'], unique=False)
    op.create_index(op.f('ix_whitelabel_instances_instance_id'), 'whitelabel_instances', ['instance_id'], unique=True)
    op.create_index(op.f('ix_whitelabel_instances_port'), 'whitelabel_instances', ['port'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_whitelabel_instances_port'), table_name='whitelabel_instances')
    op.drop_index(op.f('ix_whitelabel_instances_instance_id'), table_name='whitelabel_instances')
    op.drop_index(op.f('ix_whitelabel_instances_id'), table_name='whitelabel_instances')
    op.drop_table('whitelabel_instances')

