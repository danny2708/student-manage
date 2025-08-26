from typing import List
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import select, insert
from passlib.context import CryptContext  # type: ignore
from fastapi import HTTPException, status

from app.models.user_model import User
from app.models.student_model import Student
from app.models.teacher_model import Teacher
from app.models.manager_model import Manager
from app.models.parent_model import Parent
from app.models.class_model import Class
from app.models.role_model import Role
from app.models.association_tables import student_class_association, user_roles

from app.schemas.register_schema import (
    RegisterRequest,
    ParentAndChildrenRequest,
    RegisterStudentWithParentRequest,
)
from app.schemas.teacher_schema import TeacherCreate
from app.schemas.parent_schema import ParentCreate
from app.schemas.student_schema import StudentCreate

# Khởi tạo CryptContext với thuật toán bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """Tạo một hash an toàn từ mật khẩu."""
    return pwd_context.hash(password)


def get_role_object(db: Session, role_name: str) -> Role:
    """Hàm helper để truy vấn đối tượng Role từ database."""
    stmt = select(Role).where(Role.name == role_name)
    role = db.execute(stmt).scalars().first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy vai trò '{role_name}'."
        )
    return role


def generate_username_from_email(email: str) -> str:
    """Sinh username từ email (phần trước @)."""
    return email.split("@")[0].lower()


def register_single_user_service(db: Session, request: RegisterRequest):
    """
    Logic nghiệp vụ để đăng ký một người dùng duy nhất.
    """
    if request.user_info.role in ["student", "manager", "parent"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Không thể đăng ký người dùng với vai trò '{request.user_info.role}' qua endpoint này."
        )
    
    username = generate_username_from_email(request.user_info.email)

    stmt = select(User).where(User.username == username)
    existing_user = db.execute(stmt).scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên đăng nhập đã tồn tại."
        )

    try:
        role_object = get_role_object(db, request.user_info.role)
        hashed_password = get_password_hash(request.user_info.password)

        new_user = User(
            username=username,
            email=request.user_info.email,
            password=hashed_password,
            full_name=request.user_info.full_name,
            date_of_birth=request.user_info.date_of_birth,
            gender=request.user_info.gender,
            phone_number=request.user_info.phone_number
        )
        db.add(new_user)
        db.flush()

        user_role_stmt = insert(user_roles).values(
            user_id=new_user.user_id,
            role_id=role_object.role_id
        )
        db.execute(user_role_stmt)
        
        # Sửa lỗi: Lấy thông tin teacher và cung cấp giá trị mặc định nếu thiếu
        if request.role and request.user_info.role == "teacher":
            # Lấy dictionary teacher_info từ request.role, mặc định là dictionary rỗng
            teacher_info_from_request = request.role.get("teacher_info", {})
            
            # Tạo dictionary với các giá trị mặc định
            teacher_data = {
                "user_id": new_user.user_id,
                "base_salary_per_class": 0.0,
                "reward_bonus": 0.0
            }
            
            # Cập nhật các giá trị mặc định bằng các giá trị từ request
            teacher_data.update(teacher_info_from_request)
            
            # Sử dụng schema Pydantic để validate và lấy dữ liệu
            teacher_info_schema = TeacherCreate(**teacher_data)
            teacher_data_valid = teacher_info_schema.model_dump(exclude_unset=True)

            new_teacher = Teacher(**teacher_data_valid)
            db.add(new_teacher)

        db.commit()
        db.refresh(new_user)

        return {
            "message": f"Đăng ký người dùng vai trò '{request.user_info.role}' thành công.",
            "user_id": new_user.user_id,
            "username": username
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

def register_parent_with_children_service(db: Session, request: ParentAndChildrenRequest):
    """
    Logic nghiệp vụ để đăng ký phụ huynh và con cùng lúc.
    """
    parent_username = generate_username_from_email(request.email)
    stmt = select(User).where(User.username == parent_username)
    existing_user = db.execute(stmt).scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên đăng nhập của phụ huynh đã tồn tại."
        )

    try:
        parent_role_object = get_role_object(db, "parent")
        student_role_object = get_role_object(db, "student")

        hashed_password = get_password_hash(request.password)
        new_parent_user = User(
            username=parent_username,
            email=request.email,
            password=hashed_password,
            full_name=request.full_name,
            gender=request.gender,
            date_of_birth=request.date_of_birth,
            phone_number=request.phone_number
        )
        db.add(new_parent_user)
        db.flush()

        user_role_stmt_parent = insert(user_roles).values(
            user_id=new_parent_user.user_id,
            role_id=parent_role_object.role_id
        )
        db.execute(user_role_stmt_parent)
        
        parent_data = request.model_dump(exclude={"children_info"})
        new_parent = Parent(**parent_data, user_id=new_parent_user.user_id)
        db.add(new_parent)
        db.flush()

        child_ids = []

        for student_info in request.children_info:
            student_username = generate_username_from_email(student_info.email)
            stmt = select(User).where(User.username == student_username)
            existing_student_user = db.execute(stmt).scalars().first()
            if existing_student_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Tên đăng nhập của học sinh '{student_username}' đã tồn tại."
                )

            new_student_user = User(
                username=student_username,
                email=student_info.email,
                password=get_password_hash("password_hoc_sinh"),
                full_name=student_info.full_name,
                date_of_birth=student_info.date_of_birth,
                gender=student_info.gender,
                phone_number=student_info.phone_number
            )
            db.add(new_student_user)
            db.flush()

            user_role_stmt_student = insert(user_roles).values(
                user_id=new_student_user.user_id,
                role_id=student_role_object.role_id
            )
            db.execute(user_role_stmt_student)
            
            student_data = student_info.model_dump(exclude_unset=True)
            class_id = student_data.pop("class_id", None)
            
            new_student = Student(**student_data, user_id=new_student_user.user_id)
            db.add(new_student)
            db.flush()

            new_parent.children.append(new_student)

            if class_id:
                stmt = select(Class).where(Class.class_id == class_id)
                target_class = db.execute(stmt).scalars().first()
                if not target_class:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Không tìm thấy Class với id {class_id}."
                    )

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


def register_student_with_existing_parent_service(db: Session, request: RegisterStudentWithParentRequest):
    """
    Logic nghiệp vụ để đăng ký một học sinh và liên kết với một phụ huynh đã có.
    """
    try:
        stmt = select(User).where(User.user_id == request.parent_user_id)
        existing_parent_user = db.execute(stmt).scalars().first()
        if not existing_parent_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Phụ huynh không tồn tại."
            )

        stmt_parent = select(Parent).where(Parent.user_id == existing_parent_user.user_id)
        existing_parent = db.execute(stmt_parent).scalars().first()
        if not existing_parent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Người dùng đã cho không có vai trò 'parent'."
            )

        student_role_object = get_role_object(db, "student")

        student_username = generate_username_from_email(request.student_info.email)
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
        db.add(new_student_user)
        db.flush()

        user_role_stmt_student = insert(user_roles).values(
            user_id=new_student_user.user_id,
            role_id=student_role_object.role_id
        )
        db.execute(user_role_stmt_student)
        
        student_info_data = request.student_info.model_dump(exclude_unset=True)
        class_id = student_info_data.pop("class_id", None)
        
        new_student = Student(**student_info_data, user_id=new_student_user.user_id)
        db.add(new_student)
        db.flush()

        if class_id:
            stmt = select(Class).where(Class.class_id == class_id)
            target_class = db.execute(stmt).scalar_one_or_none()
            if not target_class:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Không tìm thấy Class với id {class_id}."
                )

            association_stmt = insert(student_class_association).values(
                student_id=new_student.student_id,
                class_id=target_class.class_id,
                enrollment_date=date.today(),
                status="Active"
            )
            db.execute(association_stmt)

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
