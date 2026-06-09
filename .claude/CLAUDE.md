# JvJ - Hướng dẫn cho Claude

## Ngôn ngữ và bối cảnh dự án

- Dự án JvJ: dịch vụ wellness therapy tại nhà ở Đà Nẵng
- Mọi tài liệu, UI, và trao đổi dùng tiếng Việt (trừ thuật ngữ kỹ thuật)
- Thương hiệu: JvJ (không đổi)

## Cấu trúc dự án

```
Project_JvJ/
├── .env                    # Environment variables chung (backend + frontend)
├── .env.example            # Template
├── docker-run.ps1          # Script chạy Docker (BE + FE)
├── media-uploads/          # Volume cho file uploads (mounted vào Docker)
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt    # Python dependencies
│   └── jvj_api/
└── frontend/
    ├── Dockerfile
    ├── DESIGN.md           # Design system (nguồn chuẩn thiết kế)
    └── src/
```

## Commands

### Docker (Development)
```bash
# Chạy cả backend + frontend
.\docker-run.ps1

# Logs
docker logs jvj-backend -f
docker logs jvj-frontend -f

# Stop & cleanup
docker stop jvj-backend jvj-frontend
docker rm jvj-backend jvj-frontend
```

### Backend Local
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Local
```bash
cd frontend
npm install
npm run dev  # http://localhost:5173
```

## Git Workflow

- `main`: production stable
- `dev`: nhánh phát triển chính
- Nhánh feature: tạo từ `dev`, format `<type>/<scope>-<description>`
- Commit: theo Conventional Commits `<type>(<scope>): <message>`
- Không push/merge/rebase nếu chưa được yêu cầu rõ

## Frontend

- Stack: React + TypeScript + Vite + Tailwind + shadcn-ui
- Design system: tuân thủ `frontend/DESIGN.md` (Deep Therapeutic Teal #0F766E, Inter font)
- Logo: dùng component `BrandLogo` từ `src/assets/brand/`
- UI changes: follow DESIGN.md, hỏi trước nếu cần lệch

## Backend

- Stack: Django 5.1 + DRF + PostgreSQL (Supabase) + Redis + Celery
- Apps: admin, auth, bookings, payments, reviews, spas, therapists, timeslots, treatments, users
- Auth: JWT + Google OAuth
