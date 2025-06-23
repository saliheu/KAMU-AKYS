from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, mezarlik, defin, ziyaretci, raporlar
from app.core.config import settings
from app.core.database import create_db_and_tables

app = FastAPI(
    title="Mezarlık Bilgi Sistemi API",
    description="Kamu kurumları için açık kaynak mezarlık yönetim sistemi",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(mezarlik.router, prefix="/api/mezarlik", tags=["Mezarlık"])
app.include_router(defin.router, prefix="/api/defin", tags=["Defin İşlemleri"])
app.include_router(ziyaretci.router, prefix="/api/ziyaretci", tags=["Ziyaretçi"])
app.include_router(raporlar.router, prefix="/api/raporlar", tags=["Raporlar"])

@app.on_event("startup")
async def startup():
    await create_db_and_tables()

@app.get("/")
async def root():
    return {"message": "Mezarlık Bilgi Sistemi API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}