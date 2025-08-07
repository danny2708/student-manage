# main.py
from fastapi import FastAPI
from app.api.v1.api import api_router # Chỉ cần import api_router từ app.api.v1.api
from app.database import Base, engine # Import Base và engine để tạo bảng
from app.models import *  # Import tất cả các models để tạo bảng
# Tạo tất cả các bảng trong cơ sở dữ liệu
# Lưu ý: Trong môi trường sản xuất, bạn nên sử dụng Alembic để quản lý migrations
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Student Management API",
    description="API cho hệ thống quản lý học sinh.",
    version="1.0.0",
)

# Bao gồm router chính của API v1
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Student Management API! Visit /docs for API documentation."}

