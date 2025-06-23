from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, or_
from typing import List, Optional
from app.core.database import get_db
from app.models.models import DefinKaydi, Mezar, Ada, User
from app.schemas.schemas import DefinKaydiCreate, DefinKaydi as DefinKaydiSchema
from app.api.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=DefinKaydiSchema)
async def create_defin_kaydi(
    defin: DefinKaydiCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if mezar exists and is available
    result = await db.execute(select(Mezar).where(Mezar.id == defin.mezar_id))
    mezar = result.scalar_one_or_none()
    
    if not mezar:
        raise HTTPException(status_code=404, detail="Mezar bulunamadı")
    
    if mezar.durum == "dolu":
        raise HTTPException(status_code=400, detail="Bu mezar dolu")
    
    # Create defin record
    db_defin = DefinKaydi(**defin.dict(), kaydeden_id=current_user.id)
    db.add(db_defin)
    
    # Update mezar status
    await db.execute(
        update(Mezar).where(Mezar.id == defin.mezar_id).values(durum="dolu")
    )
    
    # Update ada dolu_sayisi
    await db.execute(
        update(Ada).where(Ada.id == mezar.ada_id).values(
            dolu_sayisi=Ada.dolu_sayisi + 1
        )
    )
    
    await db.commit()
    await db.refresh(db_defin)
    return db_defin

@router.get("/", response_model=List[DefinKaydiSchema])
async def get_defin_kayitlari(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(DefinKaydi).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/ara", response_model=List[DefinKaydiSchema])
async def search_defin(
    q: str = Query(..., description="Arama metni (ad, soyad, TC no)"),
    db: AsyncSession = Depends(get_db)
):
    query = select(DefinKaydi).where(
        or_(
            DefinKaydi.ad_soyad.ilike(f"%{q}%"),
            DefinKaydi.tc_no == q,
            DefinKaydi.baba_adi.ilike(f"%{q}%"),
            DefinKaydi.anne_adi.ilike(f"%{q}%")
        )
    )
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{defin_id}", response_model=DefinKaydiSchema)
async def get_defin_kaydi(defin_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DefinKaydi).where(DefinKaydi.id == defin_id))
    defin = result.scalar_one_or_none()
    
    if not defin:
        raise HTTPException(status_code=404, detail="Defin kaydı bulunamadı")
    
    return defin

@router.put("/{defin_id}", response_model=DefinKaydiSchema)
async def update_defin_kaydi(
    defin_id: int,
    defin_update: DefinKaydiCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(DefinKaydi).where(DefinKaydi.id == defin_id))
    defin = result.scalar_one_or_none()
    
    if not defin:
        raise HTTPException(status_code=404, detail="Defin kaydı bulunamadı")
    
    for key, value in defin_update.dict(exclude_unset=True).items():
        setattr(defin, key, value)
    
    await db.commit()
    await db.refresh(defin)
    return defin