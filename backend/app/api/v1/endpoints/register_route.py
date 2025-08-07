# app/api/v1/endpoints/register_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext

# Import các models cần thiết, bao gồm cả Role và Class
from app.api.deps import get_db
from app.models.user_model import User
from app.models.student_model import Student
from app.models.teacher_model import Teacher
from app.models.staff_model import Staff
from app.models.manager_model import Manager
from app.models.parent_model import Parent
from app.models.class_model import Class  # Thêm import Class model
from app.models.role_model import Role

from app.schemas.register_schema import (
    RegisterRequest,
    ParentAndChildrenRequest,
    RegisterStudentWithParentRequest
)

router = APIRouter()

# Khởi tạo CryptContext với thuật toán bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Tạo một hash an toàn từ mật khẩu."""
    return pwd_context.hash(password)

def get_role_object(db: Session, role_name: str):
    """Hàm helper để truy vấn đối tượng Role từ database."""
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy vai trò '{role_name}'."
        )
    return role


# --- Endpoint 1: Đăng ký một người dùng duy nhất (single-user) ---
@router.post(
    "/single-user",
    status_code=status.HTTP_201_CREATED,
    summary="Đăng ký một người dùng duy nhất (staff, teacher, manager, student, parent)"
)
def register_single_user(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Xử lý đăng ký một người dùng duy nhất dựa trên vai trò.
    """
    existing_user = db.query(User).filter(User.username == request.user_info.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên đăng nhập đã tồn tại."
        )

    # 1. Lấy đối tượng Role từ database
    role_object = get_role_object(db, request.user_info.role)

    # 2. Tạo user cơ bản
    hashed_password = get_password_hash(request.user_info.password)
    new_user = User(
        username=request.user_info.username,
        email=request.user_info.email,
        password=hashed_password
    )

    # 3. Thêm đối tượng Role vào danh sách roles của user
    new_user.roles.append(role_object)

    db.add(new_user)
    db.flush()
    db.refresh(new_user)

    # 4. Tạo thông tin chi tiết dựa trên vai trò
    role_info_data = request.role_info.model_dump(exclude_unset=True)

    if request.user_info.role == "staff":
        new_staff = Staff(**role_info_data, user_id=new_user.user_id)
        db.add(new_staff)
    elif request.user_info.role == "teacher":
        new_teacher = Teacher(**role_info_data, user_id=new_user.user_id)
        db.add(new_teacher)
    elif request.user_info.role == "manager":
        new_manager = Manager(**role_info_data, user_id=new_user.user_id)
        db.add(new_manager)
    elif request.user_info.role == "student":
        # Do mối quan hệ nhiều-nhiều, không thể truyền class_id vào Student
        # Bạn sẽ cần một endpoint khác để gán học sinh vào lớp
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể đăng ký học sinh qua endpoint này. Vui lòng sử dụng endpoint khác để gán lớp."
        )
    elif request.user_info.role == "parent":
        new_parent = Parent(**role_info_data, user_id=new_user.user_id)
        db.add(new_parent)

    db.commit()
    db.refresh(new_user)

    return {
        "message": f"Đăng ký người dùng vai trò '{request.user_info.role}' thành công.",
        "user_id": new_user.user_id
    }


# --- Endpoint 2: Đăng ký phụ huynh và con cùng lúc (parent-and-children) ---
@router.post(
    "/parent-and-children",
    status_code=status.HTTP_201_CREATED,
    summary="Đăng ký phụ huynh và một hoặc nhiều học sinh"
)
def register_parent_with_children(
    request: ParentAndChildrenRequest,
    db: Session = Depends(get_db)
):
    """
    Xử lý đăng ký một phụ huynh và một hoặc nhiều người con trong cùng một yêu cầu.
    """
    existing_user = db.query(User).filter(User.username == request.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên đăng nhập của phụ huynh đã tồn tại."
        )

    parent_role_object = get_role_object(db, "parent")

    hashed_password = get_password_hash(request.password)
    new_parent_user = User(
        username=request.username,
        email=request.email,
        password=hashed_password
    )
    new_parent_user.roles.append(parent_role_object)

    db.add(new_parent_user)
    db.flush()

    new_parent = Parent(
        full_name=request.full_name,
        date_of_birth=request.date_of_birth,
        phone_number=request.phone_number,
        user_id=new_parent_user.user_id
    )
    db.add(new_parent)
    db.flush()

    child_ids = []
    student_role_object = get_role_object(db, "student")

    for student_info in request.children_info:
        # Kiểm tra username của học sinh để tránh trùng lặp
        student_username = f"student_{student_info.full_name.replace(' ', '').lower()}"
        existing_student_user = db.query(User).filter(User.username == student_username).first()
        if existing_student_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tên đăng nhập của học sinh '{student_username}' đã tồn tại."
            )

        student_email = f"{student_username}@example.com"
        new_student_user = User(
            username=student_username,
            email=student_email,
            password=get_password_hash("password_hoc_sinh")
        )
        new_student_user.roles.append(student_role_object)

        db.add(new_student_user)
        db.flush()

        # KHÔNG truyền class_id vào khi tạo Student
        new_student = Student(
            user_id=new_student_user.user_id,
            full_name=student_info.full_name,
            date_of_birth=student_info.date_of_birth,
            gender=student_info.gender
        )
        db.add(new_student)
        db.flush()

        # Tìm đối tượng Class để thiết lập mối quan hệ
        target_class = db.query(Class).filter(Class.class_id == student_info.class_id).first()
        if not target_class:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Không tìm thấy Class với id {student_info.class_id}."
            )
        
        # Thêm Student vào Class, SQLAlchemy sẽ xử lý bảng liên kết
        target_class.students.append(new_student)

        # Thêm Student vào Parent, SQLAlchemy sẽ xử lý bảng liên kết
        new_parent.students.append(new_student)
        
        child_ids.append(new_student.student_id)

    db.commit()
    db.refresh(new_parent_user)

    return {
        "message": "Đăng ký phụ huynh và các con thành công.",
        "parent_user_id": new_parent_user.user_id,
        "children_ids": child_ids
    }


# --- Endpoint 3: Liên kết học sinh với phụ huynh đã có (student-with-existing-parent) ---
@router.post(
    "/student-with-existing-parent",
    status_code=status.HTTP_201_CREATED,
    summary="Đăng ký một học sinh và liên kết với một phụ huynh đã có"
)
def register_student_with_parent(
    request: RegisterStudentWithParentRequest,
    db: Session = Depends(get_db)
):
    """
    Xử lý đăng ký một học sinh mới và liên kết với một phụ huynh đã có.
    """
    existing_parent_user = db.query(User).filter(User.user_id == request.parent_user_id).first()
    if not existing_parent_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Phụ huynh không tồn tại."
        )

    if not any(role.name == "parent" for role in existing_parent_user.roles):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Người dùng không có vai trò 'parent'."
        )

    existing_parent = db.query(Parent).filter(Parent.user_id == existing_parent_user.user_id).first()
    if not existing_parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thông tin chi tiết của phụ huynh không tìm thấy."
        )

    student_role_object = get_role_object(db, "student")
    
    student_username = f"{request.student_info.full_name.replace(' ', '').lower()}"
    existing_student_user = db.query(User).filter(User.username == student_username).first()
    if existing_student_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tên đăng nhập của học sinh '{student_username}' đã tồn tại."
        )

    student_email = f"{student_username}@example.com"
    new_student_user = User(
        username=student_username,
        email=student_email,
        password=get_password_hash("password_hoc_sinh")
    )
    new_student_user.roles.append(student_role_object)

    db.add(new_student_user)
    db.flush()

    # Tách class_id ra khỏi student_info để không truyền vào model Student
    student_info_data = request.student_info.model_dump()
    class_id = student_info_data.pop("class_id", None)
    
    new_student = Student(**student_info_data, user_id=new_student_user.user_id)
    db.add(new_student)
    db.flush()
    
    # Liên kết với Class
    if class_id:
        target_class = db.query(Class).filter(Class.class_id == class_id).first()
        if not target_class:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Không tìm thấy Class với id {class_id}."
            )
        target_class.students.append(new_student)

    # Liên kết với Parent
    existing_parent.students.append(new_student)

    db.commit()

    return {
        "message": "Đăng ký học sinh và liên kết với phụ huynh thành công.",
        "student_id": new_student.student_id,
        "parent_user_id": request.parent_user_id
    }
