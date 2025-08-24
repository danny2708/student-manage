# main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler # type: ignore
from apscheduler.triggers.cron import CronTrigger # type: ignore
from app.api.v1.api import api_router
from app.database import Base, engine, SessionLocal
from app.models import *
from app.services import tuition_service
import logging

# Cấu hình logging cho APScheduler
logging.basicConfig()
logging.getLogger('apscheduler').setLevel(logging.INFO)

# Tạo scheduler
scheduler = AsyncIOScheduler()

# Hàm tác vụ sẽ được lập lịch
async def run_overdue_tuitions_task():
    """Tác vụ cập nhật học phí quá hạn, chạy định kỳ."""
    db = SessionLocal()
    try:
        tuition_service.update_overdue_tuitions(db)
        print("Tác vụ cập nhật học phí quá hạn đã chạy thành công.")
    except Exception as e:
        print(f"Lỗi khi chạy tác vụ cập nhật học phí: {e}")
    finally:
        db.close()

# Hàm lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Khởi động scheduler khi ứng dụng khởi động
    # Tương tự @app.on_event("startup")
    scheduler.add_job(
        run_overdue_tuitions_task,
        trigger=CronTrigger(hour=0, minute=0),
        id="overdue_tuition_job",
        name="Update Overdue Tuitions"
    )
    scheduler.start()
    print("Scheduler đã được khởi động.")
    
    # Tạo tất cả các bảng trong cơ sở dữ liệu
    Base.metadata.create_all(bind=engine)
    
    yield # Điểm này ứng dụng sẽ chạy
    
    # Tắt scheduler khi ứng dụng tắt
    # Tương tự @app.on_event("shutdown")
    scheduler.shutdown()
    print("Scheduler đã tắt.")

# Khởi tạo ứng dụng FastAPI với lifespan handler mới
app = FastAPI(
    title="Student Management API",
    description="API cho hệ thống quản lý học sinh.",
    version="1.0.0",
    lifespan=lifespan # Thêm dòng này để sử dụng lifespan
)

# Bao gồm router chính của API v1
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Student Management API! Visit /docs for API documentation."}