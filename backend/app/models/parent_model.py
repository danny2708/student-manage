from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.association_tables import student_parent_association

class Parent(Base):
    __tablename__ = 'parents'

    parent_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.user_id', ondelete="CASCADE"), unique=True, nullable=False)

    # Many-to-many với Student
    children = relationship(
        "Student",
        secondary=student_parent_association,
        back_populates="parents"
    )

    user = relationship("User", back_populates="parent")

    def __repr__(self):
        return f"<Parent(user_id='{self.user_id}')>"
