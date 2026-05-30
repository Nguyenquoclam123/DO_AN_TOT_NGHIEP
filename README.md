# AI-Powered Matching ATS

Hệ thống ATS (Applicant Tracking System) tích hợp AI, xây dựng với NestJS, Next.js và PostgreSQL + pgvector.

## Cấu Trúc Thư Mục

```
Source Code/
├── backend/     # NestJS API Server
└── frontend/    # Next.js App
```

## Yêu Cầu Hệ Thống

- Node.js >= 18.x
- PostgreSQL >= 14 (với pgvector extension)
- Redis >= 7.x
- Gemini API Key

## Khởi Động Nhanh

### 1. Cài PostgreSQL pgvector

```bash
# macOS
brew install pgvector

# Hoặc dùng Docker
docker run -d \
  --name ats-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ats_db \
  -p 5432:5432 \
  pgvector/pgvector:pg16
```

### 2. Cài Redis

```bash
docker run -d --name ats-redis -p 6379:6379 redis:7-alpine
```

### 3. Backend

```bash
cd backend
cp .env.example .env
# Điền thông tin vào .env (đặc biệt GEMINI_API_KEY)

npm install
npm run migration:run
npm run start:dev
```

### 4. Frontend

```bash
cd frontend
cp .env.local.example .env.local

npm install
npm run dev
```

## URLs

| Service | URL |
|---|---|
| Backend API | http://localhost:4000/api/v1 |
| Swagger Docs | http://localhost:4000/api/docs |
| Frontend | http://localhost:3000 |

## Roles

| Role | Mô tả |
|---|---|
| `EMPLOYER` | Quản lý job, xem AI scoring, kéo-thả pipeline |
| `CANDIDATE` | Tìm việc, nộp CV, xem đề xuất AI |
| `ADMIN` | Kiểm duyệt, quản lý AI Control Center |
