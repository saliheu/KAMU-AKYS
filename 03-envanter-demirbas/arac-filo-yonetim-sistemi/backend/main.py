from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.database import engine, Base
from app.api.v1 import auth, vehicles, drivers, maintenance, fuel, reports
from app.core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="Araç Filo Yönetim Sistemi API",
    description="Kamu kurumları için araç filo yönetim sistemi",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(vehicles.router, prefix="/api/v1/vehicles", tags=["vehicles"])
app.include_router(drivers.router, prefix="/api/v1/drivers", tags=["drivers"])
app.include_router(maintenance.router, prefix="/api/v1/maintenance", tags=["maintenance"])
app.include_router(fuel.router, prefix="/api/v1/fuel", tags=["fuel"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])

@app.get("/")
async def root():
    return {"message": "Araç Filo Yönetim Sistemi API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)