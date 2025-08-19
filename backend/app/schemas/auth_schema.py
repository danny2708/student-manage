from pydantic import BaseModel, Field
from typing import Optional

class LoginRequest(BaseModel):
    """
    Schema cho yêu cầu đăng nhập.
    """
    username: str = Field(..., example="johndoe")
    password: str = Field(..., example="secure_password")

class LoginSuccess(BaseModel):
    """
    Schema cho phản hồi khi đăng nhập thành công.
    """
    message: str = Field(..., example="Đăng nhập thành công")
    user_id: int = Field(..., example=1)
    username: str = Field(..., example="johndoe")

    class Config:
        from_attributes = True
