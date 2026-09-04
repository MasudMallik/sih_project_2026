"""SQLAlchemy models."""
import enum
import uuid
from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import Column, DateTime, Enum, String
from sqlalchemy.dialects.postgresql import UUID

from database import Base


class UserRole(str, enum.Enum):
    citizen = "citizen"
    admin = "admin"
    field_agent = "field_agent"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.citizen)

    # Required at signup, not an optional profile field — see
    # architecture spec, Section 6a (Auth and location gating).
    home_location = Column(Geometry(geometry_type="POINT", srid=4326), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
