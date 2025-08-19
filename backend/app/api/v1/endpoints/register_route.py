import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, insert
from passlib.context import CryptContext

# Import các models cần thiết, bao gồm cả Role, Class và bảng liên kết
from app.api.deps import get_db
from app.models.user_model import User
from app.models.student_model import Student
from app.models.teacher_model import Teacher
from app.models.manager_model import Manager
from app.models.parent_model import Parent
from app.models.class_model import Class
from app.models.role_model import Role
# Correct import for sqlalchemy.Table objects
from app.models.association_tables import student_class_association

# Import các schemas đã được cập nhật 
from app.schemas.register_schema import (
    RegisterRequest,
    ParentAndChildrenRequest,
    RegisterStudentWithParentRequest,
)

from datetime import date

router = APIRouter()

# Khởi tạo CryptContext với thuật toán bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Tạo một hash an toàn từ mật khẩu."""
    return pwd_context.hash(password)

def get_role_object(db: Session, role_name: str) -> Role:
    """Hàm helper để truy vấn đối tượng Role từ database."""
    # Cú pháp truy vấn SQLAlchemy 2.0
    stmt = select(Role).where(Role.name == role_name)
    role = db.execute(stmt).scalars().first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy vai trò '{role_name}'."
        )
    return role

def parse_date_formats(date_string: str) -> date:
    """
    Hàm trợ giúp để chuyển đổi chuỗi ngày tháng từ nhiều định dạng sang đối tượng date.
    Hỗ trợ: YYYY-MM-DD, DD-MM-YYYY, MM/DD/YYYY
    """
    formats = [
        "%Y-%m-%d",  # YYYY-MM-DD
        "%d-%m-%Y",  # DD-MM-YYYY
        "%m/%d/%Y"   # MM/DD/YYYY
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_string, fmt).date()
        except ValueError:
            continue
    
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Định dạng ngày tháng '{date_string}' không hợp lệ. Vui lòng sử dụng một trong các định dạng sau: YYYY-MM-DD, DD-MM-YYYY, MM/DD/YYYY."
    )

# --- Endpoint 1: Đăng ký một người dùng duy nhất (single-user) ---
@router.post(
    "/single-user",
    status_code=status.HTTP_201_CREATED,
    summary="Đăng ký một người dùng duy nhất (staff, teacher, manager, parent)"
)
def register_single_user(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Xử lý đăng ký một người dùng duy nhất dựa trên vai trò.
    """
    if request.user_info.role == "student":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể đăng ký học sinh qua endpoint này. Vui lòng sử dụng endpoint khác."
        )

    # 1. Kiểm tra xem tên đăng nhập đã tồn tại chưa
    stmt = select(User).where(User.username == request.user_info.username)
    existing_user = db.execute(stmt).scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên đăng nhập đã tồn tại."
        )

    try:
        # 2. Lấy đối tượng Role từ database
        role_object = get_role_object(db, request.user_info.role)

        # 3. Tạo user cơ bản với các trường bổ sung
        hashed_password = get_password_hash(request.user_info.password)
        new_user = User(
            username=request.user_info.username,
            email=request.user_info.email,
            password=hashed_password,
            # Các trường bổ sung
            full_name=request.user_info.full_name,
            date_of_birth=request.user_info.date_of_birth,
            gender=request.user_info.gender,
            phone_number=request.user_info.phone_number
        )

        # 4. Thêm đối tượng Role vào danh sách roles của user
        # Dòng này đã được sửa để thêm vai trò vào người dùng
        new_user.roles.append(role_object)
        
        db.add(new_user)
        # Flush để có được user_id trước khi commit
        db.flush()
        
        # 5. Tạo thông tin chi tiết dựa trên vai trò
        if request.role_info:
            # Sửa lỗi: Kiểm tra nếu role_info là một đối tượng Pydantic có phương thức model_dump
            if hasattr(request.role_info, 'model_dump'):
                role_info_data = request.role_info.model_dump(exclude_unset=True)
            else:
                # Nếu không phải là Pydantic model (có thể là dict), dùng trực tiếp
                role_info_data = request.role_info
        else:
            role_info_data = {}

        if request.user_info.role == "teacher":
            # Lọc các khóa không hợp lệ trước khi tạo đối tượng
            valid_keys = [column.name for column in Teacher.__table__.columns]
            filtered_role_info = {k: v for k, v in role_info_data.items() if k in valid_keys}
            new_teacher = Teacher(**filtered_role_info, user_id=new_user.user_id)
            db.add(new_teacher)
        elif request.user_info.role == "manager":
            # Lọc các khóa không hợp lệ trước khi tạo đối tượng
            valid_keys = [column.name for column in Manager.__table__.columns]
            filtered_role_info = {k: v for k, v in role_info_data.items() if k in valid_keys}
            new_manager = Manager(**filtered_role_info, user_id=new_user.user_id)
            db.add(new_manager)
        elif request.user_info.role == "parent":
            # Lọc các khóa không hợp lệ trước khi tạo đối tượng
            valid_keys = [column.name for column in Parent.__table__.columns]
            filtered_role_info = {k: v for k, v in role_info_data.items() if k in valid_keys}
            new_parent = Parent(**filtered_role_info, user_id=new_user.user_id)
            db.add(new_parent)

        db.commit()
        db.refresh(new_user)
        
        # Trả về kết quả
        return {
            "message": f"Đăng ký người dùng vai trò '{request.user_info.role}' thành công.",
            "user_id": new_user.user_id
        }
    except HTTPException as e:
        db.rollback()
        raise e
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Đã xảy ra lỗi không mong muốn: {str(e)}"
        )

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
    # 1. Kiểm tra tên đăng nhập của phụ huynh
    stmt = select(User).where(User.username == request.username)
    existing_user = db.execute(stmt).scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên đăng nhập của phụ huynh đã tồn tại."
        )

    try:
        parent_role_object = get_role_object(db, "parent")
        student_role_object = get_role_object(db, "student")
        
        # 2. Tạo user và parent
        hashed_password = get_password_hash(request.password)
        new_parent_user = User(
            username=request.username,
            email=request.email,
            password=hashed_password,
            full_name=request.full_name,
            gender=request.gender,
            date_of_birth=request.date_of_birth,
            phone_number=request.phone_number
        )
        # new_parent_user.roles.append(parent_role_object)

        db.add(new_parent_user)
        db.flush()

        new_parent = Parent(
            # Chú ý: Các trường này đã được khai báo trong User, nên Parent không cần nữa
            # full_name=request.full_name,
            # date_of_birth=request.date_of_birth,
            # phone_number=request.phone_number,
            user_id=new_parent_user.user_id
        )
        db.add(new_parent)     
        db.flush()

        child_ids = []
        
        # 3. Lặp qua danh sách con để tạo user, student và liên kết
        for student_info in request.children_info:
            # Kiểm tra username của học sinh để tránh trùng lặp
            student_username = f"student_{student_info.full_name.replace(' ', '').lower()}_{date.today().strftime('%Y%m%d')}"
            stmt = select(User).where(User.username == student_username)
            existing_student_user = db.execute(stmt).scalars().first()
            if existing_student_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Tên đăng nhập của học sinh '{student_username}' đã tồn tại."
                )

            new_student_user = User(
                username=student_username,
                email= student_info.email,
                password=get_password_hash("password_hoc_sinh"),
                full_name=student_info.full_name,
                date_of_birth=student_info.date_of_birth,
                gender=student_info.gender,
                phone_number=student_info.phone_number
            )
            # new_student_user.roles.append(student_role_object)

            db.add(new_student_user)
            db.flush()

            new_student = Student(
                user_id=new_student_user.user_id
            )
            db.add(new_student)
            db.flush()

            # Tạo bản ghi liên kết student-parent
            # Sửa từ .students thành .children
            new_parent.children.append(new_student)

            # Tạo bản ghi liên kết student-class
            if student_info.class_id:
                stmt = select(Class).where(Class.class_id == student_info.class_id)
                target_class = db.execute(stmt).scalars().first()
                if not target_class:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Không tìm thấy Class với id {student_info.class_id}."
                    )
                
                # Using SQLAlchemy Core's insert for the Table object
                association_stmt = insert(student_class_association).values(
                    student_id=new_student.student_id,
                    class_id=target_class.class_id,
                    enrollment_date=date.today(),
                    status="Active"
                )
                db.execute(association_stmt)

            child_ids.append(new_student.student_id)

        db.commit()
        db.refresh(new_parent_user)

        return {
            "message": "Đăng ký phụ huynh và các con thành công.",
            "parent_user_id": new_parent_user.user_id,
            "children_ids": child_ids
        }
    except HTTPException as e:
        db.rollback()
        raise e
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Đã xảy ra lỗi không mong muốn: {str(e)}"
        )


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
    try:
        # 1. Tìm phụ huynh đã có
        stmt = select(User).where(User.user_id == request.parent_user_id)
        existing_parent_user = db.execute(stmt).scalars().first()
        if not existing_parent_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Phụ huynh không tồn tại."
            )
        
        # Kiểm tra xem người dùng có phải là phụ huynh không
        stmt_parent = select(Parent).where(Parent.user_id == existing_parent_user.user_id)
        existing_parent = db.execute(stmt_parent).scalars().first()
        if not existing_parent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Người dùng đã cho không có vai trò 'parent'."
            )
        
        student_role_object = get_role_object(db, "student")
        
        # 2. Tạo thông tin học sinh
        student_username = f"student_{request.student_info.full_name.replace(' ', '').lower()}_{date.today().strftime('%Y%m%d')}"
        stmt = select(User).where(User.username == student_username)
        existing_student_user = db.execute(stmt).scalars().first()
        if existing_student_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tên đăng nhập của học sinh '{student_username}' đã tồn tại."
            )

        new_student_user = User(
            username=student_username,
            email=request.student_info.email,
            password=get_password_hash("password_hoc_sinh"),
            full_name=request.student_info.full_name,
            date_of_birth=request.student_info.date_of_birth,
            gender=request.student_info.gender,
            phone_number=request.student_info.phone_number
        )
        # new_student_user.roles.append(student_role_object)

        db.add(new_student_user)
        db.flush()

        student_info_data = request.student_info.model_dump()
        class_id = student_info_data.pop("class_id", None)
        
        new_student = Student(user_id=new_student_user.user_id)
        db.add(new_student)
        db.flush()
        
        # 3. Liên kết học sinh với lớp
        if class_id:
            stmt = select(Class).where(Class.class_id == class_id)
            target_class = db.execute(stmt).scalar_one_or_none()
            if not target_class:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Không tìm thấy Class với id {class_id}."
                )

            # Using SQLAlchemy Core's insert for the Table object
            association_stmt = insert(student_class_association).values(
                student_id=new_student.student_id,
                class_id=target_class.class_id,
                enrollment_date=date.today(),
                status="Active"
            )
            db.execute(association_stmt)

        # 4. Liên kết học sinh với phụ huynh
        # Sửa từ .students thành .children
        existing_parent.children.append(new_student)

        db.commit()

        return {
            "message": "Đăng ký học sinh và liên kết với phụ huynh thành công.",
            "student_id": new_student.student_id,
            "parent_user_id": request.parent_user_id
        }
    except HTTPException as e:
        db.rollback()
        raise e
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Đã xảy ra lỗi không mong muốn: {str(e)}"
        )
