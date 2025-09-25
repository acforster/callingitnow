"""Fix schema mismatches

Revision ID: 002
Revises: 001
Create Date: 2024-01-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Fix groups table - rename creator_id to created_by
    op.alter_column('groups', 'creator_id', new_column_name='created_by')
    
    # Fix predictions table
    # 1. Rename prediction_hash to hash
    op.alter_column('predictions', 'prediction_hash', new_column_name='hash')
    
    # 2. Rename created_at to timestamp
    op.alter_column('predictions', 'created_at', new_column_name='timestamp')
    
    # 3. Add missing allow_backing column
    op.add_column('predictions', sa.Column('allow_backing', sa.Boolean(), default=True))
    
    # 4. Remove unused columns
    op.drop_column('predictions', 'resolve_date')
    op.drop_column('predictions', 'resolved')
    op.drop_column('predictions', 'outcome')
    
    # 5. Make category non-nullable
    op.alter_column('predictions', 'category', nullable=False)
    
    # Fix users table - rename created_at to created_at (already correct, but ensure timezone)
    # No change needed for users table
    
    # Fix votes table
    # 1. Rename vote_value to value and change type from Boolean to Integer
    op.drop_column('votes', 'vote_value')
    op.add_column('votes', sa.Column('value', sa.Integer(), nullable=False))
    
    # 2. Rename created_at to timestamp
    op.alter_column('votes', 'created_at', new_column_name='timestamp')
    
    # 3. Fix unique constraint name
    op.drop_constraint('votes_user_id_prediction_id_key', 'votes', type_='unique')
    op.create_unique_constraint('unique_vote_per_user', 'votes', ['prediction_id', 'user_id'])
    
    # Fix backings table
    # 1. Rename backer_id to backer_user_id
    op.alter_column('backings', 'backer_id', new_column_name='backer_user_id')
    
    # 2. Remove amount column (not used in current model)
    op.drop_column('backings', 'amount')
    
    # 3. Rename created_at to timestamp
    op.alter_column('backings', 'created_at', new_column_name='timestamp')
    
    # 4. Add unique constraint
    op.create_unique_constraint('unique_backing_per_user', 'backings', ['prediction_id', 'backer_user_id'])
    
    # Fix group_members table
    # 1. Rename membership_id to group_member_id
    op.alter_column('group_members', 'membership_id', new_column_name='group_member_id')
    
    # 2. Fix unique constraint name
    op.drop_constraint('group_members_group_id_user_id_key', 'group_members', type_='unique')
    op.create_unique_constraint('unique_group_membership', 'group_members', ['group_id', 'user_id'])
    
    # Fix group_predictions table
    # 1. Rename group_prediction_id to prediction_id
    op.alter_column('group_predictions', 'group_prediction_id', new_column_name='prediction_id')
    
    # 2. Rename prediction_hash to hash
    op.alter_column('group_predictions', 'prediction_hash', new_column_name='hash')
    
    # 3. Rename created_at to timestamp
    op.alter_column('group_predictions', 'created_at', new_column_name='timestamp')
    
    # 4. Add missing allow_backing column
    op.add_column('group_predictions', sa.Column('allow_backing', sa.Boolean(), default=True))
    
    # 5. Remove unused columns
    op.drop_column('group_predictions', 'resolve_date')
    op.drop_column('group_predictions', 'resolved')
    op.drop_column('group_predictions', 'outcome')
    
    # 6. Make category non-nullable
    op.alter_column('group_predictions', 'category', nullable=False)
    
    # Create missing tables for group votes and group backings
    op.create_table('group_votes',
        sa.Column('vote_id', sa.Integer(), nullable=False),
        sa.Column('prediction_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('value', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['prediction_id'], ['group_predictions.prediction_id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ),
        sa.PrimaryKeyConstraint('vote_id'),
        sa.UniqueConstraint('prediction_id', 'user_id', name='unique_group_vote_per_user')
    )
    
    op.create_table('group_backings',
        sa.Column('backing_id', sa.Integer(), nullable=False),
        sa.Column('prediction_id', sa.Integer(), nullable=False),
        sa.Column('backer_user_id', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['prediction_id'], ['group_predictions.prediction_id'], ),
        sa.ForeignKeyConstraint(['backer_user_id'], ['users.user_id'], ),
        sa.PrimaryKeyConstraint('backing_id'),
        sa.UniqueConstraint('prediction_id', 'backer_user_id', name='unique_group_backing_per_user')
    )


def downgrade() -> None:
    # This is a complex migration, downgrade would be extensive
    # For now, we'll leave it as a forward-only migration
    pass
