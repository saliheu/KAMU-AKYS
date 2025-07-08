from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import engine, Base
from routers import employees, payrolls, settings

# Veritabanı tablolarını oluştur
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    pass

app = FastAPI(
    title="Bordro ve Maaş Yönetim Sistemi",
    description="Kamu AKYS - Bordro ve Maaş Yönetim Sistemi API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router'ları dahil et
app.include_router(employees.router, prefix="/api/employees", tags=["employees"])
app.include_router(payrolls.router, prefix="/api/payrolls", tags=["payrolls"])
app.include_router(settings.router, prefix="/api", tags=["settings"])

@app.get("/")
async def root():
    return {"message": "Bordro ve Maaş Yönetim Sistemi API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 