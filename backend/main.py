# main.py
from fastapi import FastAPI
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from app.api.v1.api import api_router
from app.database import Base, engine, SessionLocal
from app.models import *
from app.services import tuition_service
import logging

# Cấu hình logging cho APScheduler
logging.basicConfig()
logging.getLogger('apscheduler').setLevel(logging.INFO)

# Tạo tất cả các bảng trong cơ sở dữ liệu
Base.metadata.create_all(bind=engine)

# Khởi tạo ứng dụng FastAPI
app = FastAPI(
    title="Student Management API",
    description="API cho hệ thống quản lý học sinh.",
    version="1.0.0",
)

# Khởi tạo scheduler
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

# ---
## Tích hợp Scheduler vào vòng đời ứng dụng

@app.on_event("startup")
async def startup_event():
    # Thêm tác vụ vào scheduler. Tùy chọn này sẽ chạy tác vụ vào 0h00 mỗi ngày.
    scheduler.add_job(
        run_overdue_tuitions_task,
        trigger=CronTrigger(hour=0, minute=0),
        id="overdue_tuition_job",
        name="Update Overdue Tuitions"
    )

    # Bắt đầu scheduler
    scheduler.start()
    print("Scheduler đã được khởi động.")


@app.on_event("shutdown")
async def shutdown_event():
    # Tắt scheduler khi ứng dụng dừng
    scheduler.shutdown()
    print("Scheduler đã tắt.")

# ---
## Cấu hình Router và Endpoint
# Bao gồm router chính của API v1
app.include_router(api_router, prefix="/api/v1")
