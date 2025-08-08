# app/models/role_model.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.association_tables import user_roles # Import bảng trung gian


class Role(Base):
    """
    Model cho bảng roles.
    """
    __tablename__ = 'roles'
    role_id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)

    # Mối quan hệ với người dùng (many-to-many)
    users = relationship("User", secondary=user_roles, back_populates="roles")

    def __repr__(self):
        return f"<Role(name='{self.name}')>"

