from datetime import date
from pydantic import BaseModel
from typing import List, Optional
from .base_user_mixin import BaseUserMixin

class SheetUserCreate(BaseUserMixin):
    username: str
    password: str
    first_password: Optional[str] = None   # ✅ để lưu mật khẩu raw
    role: Optional[str] = "student"        # ✅ mặc định học sinh
    date_of_birth: Optional[date] = None

class SheetUserImportRequest(BaseModel):
    users: List[SheetUserCreate]
