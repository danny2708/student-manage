from pydantic import BaseModel, Field
from typing import Optional
from app.models.user import UserRole 

class UserBase(BaseModel):
    username: str = Field(..., example="john.doe")
    role: UserRole = Field(..., example=UserRole.STUDENT)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, example="securepassword123")

class UserUpdate(UserBase):
    username: Optional[str] = Field(None, example="john.doe_new")
    password: Optional[str] = Field(None, min_length=6, example="newsecurepassword")
    role: Optional[UserRole] = Field(None, example=UserRole.TEACHER)

class User(UserBase):
    user_id: int = Field(..., example=1)

    class Config:
        from_attributes = True 
        
class UserInDB(User):
    hashed_password: str # Mật khẩu đã được băm

