from datetime import date
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.api import deps
from app.schemas.tuition_schema import TuitionCreate, TuitionUpdate, TuitionRead, TuitionPaymentStatusUpdate
from app.models.tuition_model import PaymentStatus
from app.crud import tuition_crud
from app.services import tuition_service

router = APIRouter()

@router.post("/", response_model=TuitionRead)
def create_tuition(tuition_in: TuitionCreate, db: Session = Depends(deps.get_db)):
    return tuition_crud.create_tuition(db, tuition_in)

@router.get("/{tuition_id}", response_model=TuitionRead)
def get_tuition(tuition_id: int, db: Session = Depends(deps.get_db)):
    db_tuition = tuition_crud.get_tuition(db, tuition_id)
    if not db_tuition:
        raise HTTPException(status_code=404, detail="Tuition not found")
    return db_tuition

@router.get("/", response_model=List[TuitionRead])
def list_tuitions(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    return tuition_crud.get_all_tuitions(db, skip=skip, limit=limit)

@router.put("/{tuition_id}", response_model=TuitionRead)
def update_tuition_details(
    tuition_id: int,
    tuition_in: TuitionUpdate,
    db: Session = Depends(deps.get_db)
):
    """
    Cập nhật các thông tin chi tiết của học phí (hạn đóng, số tiền, kỳ học).
    """
    db_tuition = tuition_crud.get_tuition(db, tuition_id)
    if not db_tuition:
        raise HTTPException(status_code=404, detail="Tuition not found")
        
    if db_tuition.payment_status == PaymentStatus.paid:
        raise HTTPException(status_code=400, detail="Không thể cập nhật chi tiết học phí đã thanh toán.")

    updated_tuition = tuition_crud.update_tuition_details(db, tuition_id, tuition_in)
    return updated_tuition

@router.patch("/{tuition_id}/status", response_model=TuitionRead)
def update_tuition_payment_status(
    tuition_id: int,
    status_in: TuitionPaymentStatusUpdate,
    db: Session = Depends(deps.get_db)
):
    """
    Cập nhật trạng thái thanh toán của học phí.
    """
    db_tuition = tuition_crud.get_tuition(db, tuition_id)
    if not db_tuition:
        raise HTTPException(status_code=404, detail="Tuition not found")
        
    updated_tuition = tuition_crud.update_tuition_payment_status(db, tuition_id, status_in.payment_status)
    return updated_tuition

@router.delete("/{tuition_id}", response_model=TuitionRead)
def delete_tuition(tuition_id: int, db: Session = Depends(deps.get_db)):
    db_tuition = tuition_crud.delete_tuition(db, tuition_id)
    if not db_tuition:
        raise HTTPException(status_code=404, detail="Tuition not found")
    return db_tuition

@router.post("/tuitions/generate-all", status_code=202)
def generate_tuition_for_all_students(
    background_tasks: BackgroundTasks,
    term: int = Query(..., gt=0, description="Kỳ học để tạo học phí"),
    due_date: date = Query(..., description="Hạn thanh toán"),
    db: Session = Depends(deps.get_db),
):
    """
    Kích hoạt quá trình tính toán và tạo bản ghi học phí cho **tất cả** học sinh.
    
    Quá trình này sẽ chạy ngầm để không làm treo hệ thống.
    """
    # Thêm tác vụ vào hàng đợi chạy nền
    background_tasks.add_task(
        tuition_service.create_tuition_for_all_students,
        db=db,
        term=term,
        due_date=due_date
    )
    
    # Trả về thông báo ngay lập tức
    return {"message": "Đã chấp nhận yêu cầu. Quá trình tạo học phí đang được xử lý trong nền."}