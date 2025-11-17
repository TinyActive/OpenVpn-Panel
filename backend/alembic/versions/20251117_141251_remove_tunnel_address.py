"""remove tunnel_address columns

Revision ID: remove_tunnel_address
Revises: 9710b4923333
Create Date: $(date '+%Y-%m-%d %H:%M:%S')

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'remove_tunnel_address'
down_revision = '9710b4923333'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Remove tunnel_address from nodes table
    with op.batch_alter_table('nodes', schema=None) as batch_op:
        batch_op.drop_column('tunnel_address')
    
    # Remove tunnel_address from settings table
    with op.batch_alter_table('settings', schema=None) as batch_op:
        batch_op.drop_column('tunnel_address')


def downgrade() -> None:
    # Add tunnel_address back to settings table
    with op.batch_alter_table('settings', schema=None) as batch_op:
        batch_op.add_column(sa.Column('tunnel_address', sa.String(), nullable=True))
    
    # Add tunnel_address back to nodes table
    with op.batch_alter_table('nodes', schema=None) as batch_op:
        batch_op.add_column(sa.Column('tunnel_address', sa.String(), nullable=True))
