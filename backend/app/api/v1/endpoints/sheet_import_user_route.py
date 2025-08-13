from fastapi import APIRouter, HTTPException
from google.oauth2 import service_account
from googleapiclient.discovery import build
import requests
import os
import json
from dotenv import load_dotenv
from app.schemas.user_schema import SheetUserCreate

router = APIRouter()

# Load biến môi trường từ file credentials.env
load_dotenv("credentials.env")

# Lấy credentials từ env
cred_json = os.getenv("GOOGLE_SHEET_CREDENTIAL")
if not cred_json:
    raise RuntimeError("GOOGLE_SHEET_CREDENTIAL is not set in environment variables")

credentials_info = json.loads(cred_json)
SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]

# ID & Range Google Sheets
SPREADSHEET_ID = os.getenv("SPREADSHEET_ID")
if not SPREADSHEET_ID:
    raise RuntimeError("SPREADSHEET_ID is not set in environment variables")

RANGE_NAME = "Sheet1!A2:E"  # chỉnh theo sheet của bạn

# API POST nhiều user
IMPORT_USER_API = "http://localhost:8000/api/v1/users/import_user"

@router.post("/import-users")
def import_users_from_sheet():
    try:
        creds = service_account.Credentials.from_service_account_info(
            credentials_info, scopes=SCOPES
        )
        service = build("sheets", "v4", credentials=creds)
        sheet = service.spreadsheets()

        result = sheet.values().get(
            spreadsheetId=SPREADSHEET_ID, range=RANGE_NAME
        ).execute()
        values = result.get("values", [])

        if not values:
            raise HTTPException(status_code=400, detail="No data found in Google Sheet")

        users = []
        for row in values:
            # Giả định cột: username, full_name, email, password, role
            if len(row) < 5:
                continue
            user = SheetUserCreate(
                username=row[0],
                full_name=row[1],
                email=row[2],
                password=row[3],
                role=row[4]
            )
            users.append(user.dict())

        if not users:
            raise HTTPException(status_code=400, detail="No valid users found")

        # Gửi POST nhiều user 1 lần
        response = requests.post(IMPORT_USER_API, json=users)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)

        return {"message": f"Imported {len(users)} users successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
