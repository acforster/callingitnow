"""Fix enum values to match frontend

Revision ID: 003
Revises: 002
Create Date: 2024-01-03 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Update LoginType enum values from uppercase to lowercase
    # First, update existing data
    op.execute("UPDATE users SET login_type = 'password' WHERE login_type = 'PASSWORD'")
    op.execute("UPDATE users SET login_type = 'google' WHERE login_type = 'GOOGLE'")
    
    # Drop and recreate the enum with lowercase values
    op.execute("ALTER TYPE logintype RENAME TO logintype_old")
    op.execute("CREATE TYPE logintype AS ENUM ('password', 'google')")
    op.execute("ALTER TABLE users ALTER COLUMN login_type TYPE logintype USING login_type::text::logintype")
    op.execute("DROP TYPE logintype_old")


def downgrade() -> None:
    # Reverse the enum changes
    op.execute("UPDATE users SET login_type = 'PASSWORD' WHERE login_type = 'password'")
    op.execute("UPDATE users SET login_type = 'GOOGLE' WHERE login_type = 'google'")
    
    op.execute("ALTER TYPE logintype RENAME TO logintype_old")
    op.execute("CREATE TYPE logintype AS ENUM ('PASSWORD', 'GOOGLE')")
    op.execute("ALTER TABLE users ALTER COLUMN login_type TYPE logintype USING login_type::text::logintype")
    op.execute("DROP TYPE logintype_old")
