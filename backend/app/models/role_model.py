# app/models/role_model.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.association_tables import user_roles # Import bảng trung gian

class Role(Base):
    __tablename__ = "roles"

    role_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

    # Thêm mối quan hệ ngược lại với bảng trung gian user_roles
    users = relationship("User", secondary=user_roles, back_populates="roles")

    def __repr__(self):
        return f"<Role(role_id={self.role_id}, name='{self.name}')>"
