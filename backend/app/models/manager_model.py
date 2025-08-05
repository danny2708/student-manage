from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Manager(Base):
    __tablename__ = "managers"

    manager_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), unique=True, nullable=False)
    name = Column(String, nullable=False)
    user = relationship("User", backref="manager_profile")

