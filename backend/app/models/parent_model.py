# app/models/parent_model.py
from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship

# Import Base và bảng liên kết
from app.database import Base
from app.models.association_tables import StudentParentAssociation
class Parent(Base):
    """
    Model cho bảng parents.
    """
    __tablename__ = 'parents'
    parent_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), unique=True, nullable=False)

    # Mối quan hệ với người dùng (one-to-one)
    user = relationship("User", back_populates="parent")

    # Mối quan hệ với học sinh (many-to-many)
    children = relationship("Student", secondary=StudentParentAssociation, back_populates="parents")

    def __repr__(self):
        return f"<Parent(user_id='{self.user_id}')>"
