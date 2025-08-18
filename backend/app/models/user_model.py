from sqlalchemy import Column, Integer, String, Date
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.association_tables import user_roles

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    gender = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    first_password = Column(String, nullable=True)

    roles = relationship("Role", secondary=user_roles, back_populates="users")
    manager = relationship("Manager", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    teacher = relationship("Teacher", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    student = relationship("Student", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    parent = relationship("Parent", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    
    def __repr__(self):
        return f"<User(user_id={self.user_id}, username='{self.username}')>"