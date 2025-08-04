# schemas.py
from pydantic import BaseModel

class ClassCreate(BaseModel):
    class_id: int | None = None  # ID có thể là None khi tạo mới
    class_name: str
    teacher_id: int
    class Config:
        orm_mode = True  # Cho phép chuyển đổi từ ORM model sang Pydantic model

class TeacherCreate(BaseModel):
    user_id: int
    full_name: str
    email: str
    phone_number: str