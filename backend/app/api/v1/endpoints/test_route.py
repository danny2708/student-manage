# app/api/v1/endpoints/test_route.py
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query, status
from sqlalchemy.orm import Session
from typing import List

# Import các CRUD operations và schemas đã được cập nhật
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query, status
from sqlalchemy.orm import Session
from typing import List

# Import các CRUD operations và schemas đã được cập nhật
from app.crud import test_crud
from app.crud import student_crud
from app.crud import class_crud
from app.schemas import test_schema
from app.api import deps
# Import dependency factory
from app.api.auth.auth import has_roles, get_current_active_user
from app.services.excel_services.import_tests import import_tests_from_excel

router = APIRouter()

# Dependency cho quyền truy cập của Manager
MANAGER_ONLY = has_roles(["manager"])

# Dependency cho quyền truy cập của Manager hoặc Teacher
MANAGER_OR_TEACHER = has_roles(["manager", "teacher"])

@router.post(
    "/",
    response_model=test_schema.Test,
    status_code=status.HTTP_201_CREATED,
    summary="Tạo một bài kiểm tra mới",
    dependencies=[Depends(MANAGER_OR_TEACHER)]
)
def create_new_test(
    test_in: test_schema.TestCreate,
    db: Session = Depends(deps.get_db)
):
    db_student = student_crud.get_student(db, student_user_id=test_in.student_user_id)
    if not db_student:
        raise HTTPException(status_code=404, detail=f"Student with id {test_in.student_user_id} not found.")

    db_class = class_crud.get_class(db, class_id=test_in.class_id)
    if not db_class:
        raise HTTPException(status_code=404, detail=f"Class with id {test_in.class_id} not found.")

    # Tạo test, tự động lấy subject_id và teacher_user_id từ class
    db_test = test_crud.create_test(db, test_in)
    if not db_test:
        raise HTTPException(status_code=400, detail="Không thể tạo bài kiểm tra.")

    return db_test

@router.get(
    "/", 
    response_model=List[test_schema.Test],
    summary="Lấy danh sách tất cả các bài kiểm tra",
    dependencies=[Depends(MANAGER_OR_TEACHER)] # Chỉ manager hoặc teacher có quyền xem
)
def get_all_tests(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(deps.get_db)
):
    """
    Lấy danh sách tất cả các bài kiểm tra.
    
    Quyền truy cập: **manager**, **teacher**
    """
    tests = test_crud.get_all_tests(db, skip=skip, limit=limit)
    return tests

@router.get(
    "/by_student/{student_user_id}",
    response_model=List[test_schema.Test],
    summary="Lấy danh sách các bài kiểm tra của một học sinh",
    dependencies=[Depends(get_current_active_user)]
)
def get_tests_by_student(
    student_user_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Lấy danh sách các bài kiểm tra của một học sinh cụ thể.
    
    Quyền truy cập: **all authenticated users**. Student và parent chỉ có thể xem của chính họ.
    """
    db_student = student_crud.get_student(db, student_user_id=student_user_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_user_id} not found."
        )
    
    return test_crud.get_tests_by_student_user_id(db, student_user_id=student_user_id)

@router.get(
    "/{test_id}", 
    response_model=test_schema.Test,
    summary="Lấy thông tin của một bản ghi bài kiểm tra cụ thể bằng ID",
    dependencies=[Depends(get_current_active_user)] # Tất cả người dùng đã đăng nhập có thể xem
)
def get_test(
    test_id: int, 
    db: Session = Depends(deps.get_db)
):
    """
    Lấy thông tin của một bản ghi bài kiểm tra cụ thể bằng ID.
    
    Quyền truy cập: **all authenticated users**. Student và parent chỉ có thể xem của chính họ.
    """
    db_test = test_crud.get_test(db, test_id=test_id)
    if db_test is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bài kiểm tra không tìm thấy."
        )
    return db_test

@router.put(
    "/{test_id}",
    response_model=test_schema.Test,
    summary="Cập nhật một bài kiểm tra",
    dependencies=[Depends(MANAGER_OR_TEACHER)]
)
def update_existing_test(
    test_id: int,
    test_update: test_schema.TestUpdate,
    db: Session = Depends(deps.get_db)
):
    db_test = test_crud.get_test(db, test_id=test_id)
    if not db_test:
        raise HTTPException(status_code=404, detail="Bài kiểm tra không tìm thấy.")

    # Cập nhật test, nếu class_id thay đổi sẽ tự lấy subject_id và teacher_user_id mới
    updated_test = test_crud.update_test(db, test_id, test_update)
    if not updated_test:
        raise HTTPException(status_code=400, detail="Không thể cập nhật bài kiểm tra.")

    return updated_test

@router.delete(
    "/{test_id}", 
    summary="Xóa một bản ghi bài kiểm tra cụ thể bằng ID",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(MANAGER_ONLY)] # Chỉ manager có quyền xóa
)
def delete_existing_test(
    test_id: int, 
    db: Session = Depends(deps.get_db)
):
    """
    Xóa một bản ghi bài kiểm tra cụ thể bằng ID.
    
    Quyền truy cập: **manager**
    """
    db_test = test_crud.get_test(db, test_id=test_id)
    if db_test is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bài kiểm tra không tìm thấy."
        )
    
    deleted_test = test_crud.delete_test(db, db_obj=db_test)
    return {
        "message": "Bài kiểm tra đã được xóa thành công.",
        "deleted_test_id": deleted_test.test_id,
        "status": "success"
    }

@router.post(
    "/import",
    summary="Import danh sách điểm kiểm tra từ file Excel vào DB",
    dependencies=[Depends(MANAGER_OR_TEACHER)] # Chỉ manager hoặc teacher có quyền import
)
def import_tests_endpoint(
    class_id: int = Query(..., description="ID của lớp cần import bài kiểm tra"),
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
):
    """
    Import danh sách điểm kiểm tra từ file Excel vào DB.
    
    Quyền truy cập: **manager**, **teacher**
    """
    try:
        # Kiểm tra sự tồn tại của class_id trước khi import
        db_class = class_crud.get_class(db, class_id=class_id)
        if not db_class:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Class with id {class_id} not found."
            )
            
        result = import_tests_from_excel(db, file, class_id)
        return {"message": "Import thành công", "result": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
