from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Parent(Base):
    __tablename__ = 'parents'

    parent_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.user_id', ondelete="CASCADE"), unique=True, nullable=False)

    # Một phụ huynh có nhiều học sinh
    children = relationship("Student", back_populates="parent")

    user = relationship("User", back_populates="parent")

    def __repr__(self):
        return f"<Parent(user_id='{self.user_id}')>"
