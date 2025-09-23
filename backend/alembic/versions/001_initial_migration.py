"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table('users',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=True),
        sa.Column('handle', sa.String(), nullable=False),
        sa.Column('login_type', sa.Enum('PASSWORD', 'GOOGLE', name='logintype'), nullable=False),
        sa.Column('wisdom_level', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('user_id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_handle'), 'users', ['handle'], unique=True)
    op.create_index(op.f('ix_users_user_id'), 'users', ['user_id'], unique=False)

    # Create groups table
    op.create_table('groups',
        sa.Column('group_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('visibility', sa.Enum('PRIVATE', 'SEMI_PUBLIC', name='groupvisibility'), nullable=False),
        sa.Column('creator_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['creator_id'], ['users.user_id'], ),
        sa.PrimaryKeyConstraint('group_id')
    )
    op.create_index(op.f('ix_groups_group_id'), 'groups', ['group_id'], unique=False)

    # Create predictions table
    op.create_table('predictions',
        sa.Column('prediction_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('category', sa.String(), nullable=True),
        sa.Column('visibility', sa.Enum('PUBLIC', 'PRIVATE', name='visibility'), nullable=False),
        sa.Column('prediction_hash', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('resolve_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('resolved', sa.Boolean(), nullable=True),
        sa.Column('outcome', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ),
        sa.PrimaryKeyConstraint('prediction_id'),
        sa.UniqueConstraint('prediction_hash')
    )
    op.create_index(op.f('ix_predictions_prediction_id'), 'predictions', ['prediction_id'], unique=False)

    # Create group_members table
    op.create_table('group_members',
        sa.Column('membership_id', sa.Integer(), nullable=False),
        sa.Column('group_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.Enum('ADMIN', 'MEMBER', name='grouprole'), nullable=False),
        sa.Column('joined_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['group_id'], ['groups.group_id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ),
        sa.PrimaryKeyConstraint('membership_id'),
        sa.UniqueConstraint('group_id', 'user_id')
    )

    # Create votes table
    op.create_table('votes',
        sa.Column('vote_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('prediction_id', sa.Integer(), nullable=False),
        sa.Column('vote_value', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['prediction_id'], ['predictions.prediction_id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ),
        sa.PrimaryKeyConstraint('vote_id'),
        sa.UniqueConstraint('user_id', 'prediction_id')
    )

    # Create backings table
    op.create_table('backings',
        sa.Column('backing_id', sa.Integer(), nullable=False),
        sa.Column('backer_id', sa.Integer(), nullable=False),
        sa.Column('prediction_id', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['backer_id'], ['users.user_id'], ),
        sa.ForeignKeyConstraint(['prediction_id'], ['predictions.prediction_id'], ),
        sa.PrimaryKeyConstraint('backing_id')
    )

    # Create group_predictions table
    op.create_table('group_predictions',
        sa.Column('group_prediction_id', sa.Integer(), nullable=False),
        sa.Column('group_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('category', sa.String(), nullable=True),
        sa.Column('prediction_hash', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('resolve_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('resolved', sa.Boolean(), nullable=True),
        sa.Column('outcome', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['group_id'], ['groups.group_id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ),
        sa.PrimaryKeyConstraint('group_prediction_id'),
        sa.UniqueConstraint('prediction_hash')
    )


def downgrade() -> None:
    op.drop_table('group_predictions')
    op.drop_table('backings')
    op.drop_table('votes')
    op.drop_table('group_members')
    op.drop_table('predictions')
    op.drop_table('groups')
    op.drop_index(op.f('ix_users_user_id'), table_name='users')
    op.drop_index(op.f('ix_users_handle'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
