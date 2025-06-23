from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.models.models import Mezarlik, Ada, Mezar, User
from app.schemas.schemas import MezarlikCreate, Mezarlik as MezarlikSchema, AdaCreate, Ada as AdaSchema, MezarCreate, Mezar as MezarSchema
from app.api.auth import get_current_user

router = APIRouter()

# Mezarlık endpoints
@router.get("/", response_model=List[MezarlikSchema])
async def get_mezarliklar(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Mezarlik).offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/", response_model=MezarlikSchema)
async def create_mezarlik(
    mezarlik: MezarlikCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_mezarlik = Mezarlik(**mezarlik.dict())
    db.add(db_mezarlik)
    await db.commit()
    await db.refresh(db_mezarlik)
    return db_mezarlik

@router.get("/{mezarlik_id}", response_model=MezarlikSchema)
async def get_mezarlik(mezarlik_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Mezarlik).where(Mezarlik.id == mezarlik_id))
    mezarlik = result.scalar_one_or_none()
    if not mezarlik:
        raise HTTPException(status_code=404, detail="Mezarlık bulunamadı")
    return mezarlik

# Ada endpoints
@router.post("/ada/", response_model=AdaSchema)
async def create_ada(
    ada: AdaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_ada = Ada(**ada.dict())
    db.add(db_ada)
    await db.commit()
    await db.refresh(db_ada)
    return db_ada

@router.get("/{mezarlik_id}/adalar", response_model=List[AdaSchema])
async def get_adalar(mezarlik_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Ada).where(Ada.mezarlik_id == mezarlik_id))
    return result.scalars().all()

# Mezar endpoints
@router.post("/mezar/", response_model=MezarSchema)
async def create_mezar(
    mezar: MezarCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_mezar = Mezar(**mezar.dict())
    db.add(db_mezar)
    await db.commit()
    await db.refresh(db_mezar)
    return db_mezar

@router.get("/ada/{ada_id}/mezarlar", response_model=List[MezarSchema])
async def get_mezarlar(ada_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Mezar).where(Mezar.ada_id == ada_id))
    return result.scalars().all()

@router.get("/mezar/bos", response_model=List[MezarSchema])
async def get_bos_mezarlar(
    mezarlik_id: int,
    db: AsyncSession = Depends(get_db)
):
    # Get all empty graves in a cemetery
    query = select(Mezar).join(Ada).where(
        Ada.mezarlik_id == mezarlik_id,
        Mezar.durum == "bos"
    )
    result = await db.execute(query)
    return result.scalars().all()