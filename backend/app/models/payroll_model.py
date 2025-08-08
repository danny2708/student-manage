from sqlalchemy import Column, Integer, ForeignKey, Date, DECIMAL
from sqlalchemy.orm import relationship
from app.database import Base

class Payroll(Base):
    """
    Model cho bảng payroll.
    """
    __tablename__ = 'payroll'
    payroll_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    month = Column(Integer, nullable=False)
    base_salary = Column(DECIMAL(10, 2), nullable=False)
    reward_bonus = Column(DECIMAL(10, 2), nullable=False)
    total = Column(DECIMAL(10, 2), nullable=False)
    sent_date = Column(Date, nullable=False)

    # Mối quan hệ với người dùng (many-to-one)
    user = relationship("User")
