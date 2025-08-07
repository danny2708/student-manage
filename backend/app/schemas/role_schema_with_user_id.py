from datetime import date
from pydantic import BaseModel
from typing import Optional

# --- Schemas for linking a role to an existing user ---

class StaffCreateWithUser(BaseModel):
    user_id: int
    name: str
    date_of_birth: Optional[date] = None
    salary: Optional[float] = None

class StudentCreateWithUser(BaseModel):
    user_id: int
    name: str
    date_of_birth: Optional[date] = None
    class_name: Optional[str] = None

class TeacherCreateWithUser(BaseModel):
    user_id: int
    name: str
    date_of_birth: Optional[date] = None
    subject: Optional[str] = None

class ManagerCreateWithUser(BaseModel):
    user_id: int
    name: str
    date_of_birth: Optional[date] = None
    salary: Optional[float] = None

class ParentCreateWithUser(BaseModel):
    user_id: int
    name: str
    date_of_birth: Optional[date] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None