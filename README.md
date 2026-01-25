# 🎓 Student Management System

A **full‑stack student management platform** with a scalable FastAPI backend and a modern Next.js frontend. The system supports managing **students, classes, attendance, evaluations, payroll, notifications**, and more — designed for real‑world school and training center operations.

---

## ✨ Key Features

* 🔐 **Secure Authentication** – Token‑based auth with role‑based access control (admin, manager, teacher, parent, student).
* 🧩 **Modular Backend Architecture** – Clear separation of models, schemas, services, and API routes.
* ⚡ **High‑Performance APIs** – Built with FastAPI, async support, and PostgreSQL.
* 🖥️ **Modern Frontend** – Next.js + React dashboard tailored for different user roles.
* 🧪 **Developer‑Friendly** – Swagger / OpenAPI docs, Alembic migrations, and clear project structure.

---

## 🗂️ Project Structure

```text
student-management/
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   ├── api/             # API route definitions
│   │   └── crud/            # CRUD operations (DB interaction logic)
│   ├── main.py              # FastAPI application entrypoint
│   ├── recreate_db.py       # Dev helper: reset & seed database
│   ├── requirements.txt
│   └── credentials.env      # Environment variables (not committed)
│
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── pages/            # Route‑based pages
│   │   ├── components/       # Reusable UI components
│   │   ├── services/         # API client & helpers
│   │   └── styles/
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## 🧰 Tech Stack

### Backend

* **Language**: Python
* **Framework**: FastAPI
* **ORM**: SQLAlchemy
* **Validation**: Pydantic
* **Database**: PostgreSQL 
* **Migrations**: Alembic (optional)
* **ASGI Server**: Uvicorn

### Frontend

* **Framework**: Next.js (React)
* **Language**: TypeScript
* **Tooling**: Vite‑based dev setup
* **State & Data**: Modern React patterns

### Dev & Tooling

* httpx (HTTP client)
* Standard Python packaging & virtual environments

---

## 📋 Requirements

* **Python** ≥ 3.10
* **Node.js** ≥ 18
* **PostgreSQL** ≥ 13

Dependency snapshots:

* Backend: `backend/requirements.txt`
* Root (overview): top‑level `requirements.txt`

---

## 🚀 Quickstart (Development)

### 1️⃣ Backend (Windows / PowerShell)

```powershell
# from repository root
cd backend

# create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# install dependencies
pip install -r requirements.txt
```

#### Configure environment variables

Edit the file below and **do not commit secrets**:

```text
backend/credentials.env
```

Set values for:

* `DATABASE_URL`
* `SECRET_KEY`
* JWT / security settings

#### Start backend server

```powershell
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at:

* API: `http://localhost:8000`
* Swagger UI: `http://localhost:8000/docs`
* ReDoc: `http://localhost:8000/redoc`

---

### 2️⃣ Frontend (Development)

```bash
cd frontend
pnpm install      # or npm install / yarn
pnpm run dev      # or npm run dev
```

Frontend will be available at:

```text
http://localhost:3000
```

---

## 🗄️ Database

* The system is designed for **PostgreSQL**.
* Update the database connection string in:

```text
backend/credentials.env
```

### Development helper

A utility script is provided to reset and seed the database:

```bash
python backend/recreate_db.py
```

> ⚠️ This script is intended **for development only**.

---

## 🔌 API Documentation

When running locally, the backend automatically exposes:

* 📘 **Swagger / OpenAPI** → `/docs`
* 📕 **ReDoc** → `/redoc`

These provide full endpoint documentation, schemas, and testing utilities.

---

## 🔒 Security Notes

* Never commit `credentials.env` or production secrets.
* Use strong secret keys and environment‑specific configs.
* Review role‑based permissions before deploying to production.


## 📄 License

This project is provided for educational and internal use.

---

## 🖥️ UI Demo

### Login/Sign up
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/917688d5-ac53-4b24-a43d-1f7ef7316a4e" />


### Admin / Manager View
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/ca033d1d-1d33-4790-92d8-b83e93b0af5d" />
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/9a98206d-189f-4eb5-b61f-fbff4a3ad782" />


### Student View
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/cd599831-add1-4230-9d07-30c666261603" />
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/ddada980-f093-4288-ab2a-0b97e2d2e65d" />


### Teacher View
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/a0231e59-5bee-4a06-a0a1-4fb2abd0a62e" />
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/1445925c-27a6-4c1f-982d-af5c95748887" />


### Parent View
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/17ce5dc1-392a-4d67-9954-e6881d48a3e9" />


