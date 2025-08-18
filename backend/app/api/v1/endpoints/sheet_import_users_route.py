#sheet_import_users_route.py
import logging
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.api import deps
from app.services import sheet_import_user_service

router = APIRouter()

class ImportUsersResponse(BaseModel):
    status: str
    imported: dict   # vì service trả về {"students": {...}, "parents": {...}}

@router.post("/import-users", response_model=ImportUsersResponse)
def import_users_from_sheet(
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
):
    try:
        result = sheet_import_user_service.import_users(file, db)
        return {"status": "success", "imported": result}
    except Exception as e:
        logging.exception("Import failed")
        raise HTTPException(status_code=400, detail=f"Import failed: {str(e)}")

