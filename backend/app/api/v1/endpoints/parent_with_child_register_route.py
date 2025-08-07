# D:\student-management-app\backend\app\api\v1\endpoints\parent_with_child_register_route.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
# Import ParentCreate từ parent_schema
from app.schemas.parent_schema import ParentCreate
# Import ParentWithChildrenCreate từ file schema mới
from app.schemas.parent_with_children_schema import ParentWithChildrenCreate
from app.crud import parent_crud, user_crud, student_crud
from app.models.association_tables import student_parent_association 

router = APIRouter()

@router.post("/", response_model=ParentCreate, status_code=status.HTTP_201_CREATED)
def register_parent_with_children(
    request_data: ParentWithChildrenCreate,
    db: Session = Depends(get_db)
):
    # Tách dữ liệu của parent và children
    parent_data = request_data.parent_info
    children_data = request_data.children_info

    # 1. Tạo đối tượng User và Parent
    try:
        user_in = parent_data.user_info
        # Kiểm tra user đã tồn tại chưa
        if user_crud.get_user_by_email(db, email=user_in.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email đã tồn tại."
            )
        
        # Tạo đối tượng parent và user
        db_parent = parent_crud.create_parent(db=db, parent_data=parent_data)
        
        # 2. Tạo đối tượng Student và liên kết với Parent
        for child_info in children_data:
            # Tạo student
            db_student = student_crud.create_student(db=db, student_data=child_info)
            
            # Tạo liên kết Student-Parent
            student_parent_association = student_parent_association(
                student_id=db_student.user_id,
                parent_id=db_parent.user_id
            )
            db.add(student_parent_association)
        
        db.commit()
        db.refresh(db_parent)

    except HTTPException:
        # Nếu có lỗi, rollback lại các thay đổi
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Đã xảy ra lỗi server: {e}"
        )
    
    return db_parent
