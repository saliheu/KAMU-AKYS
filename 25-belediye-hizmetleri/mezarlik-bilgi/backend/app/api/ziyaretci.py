from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.models import ZiyaretciKaydi, DefinKaydi
from app.schemas.schemas import ZiyaretciKaydiCreate, ZiyaretciKaydi as ZiyaretciKaydiSchema

router = APIRouter()

@router.post("/", response_model=ZiyaretciKaydiSchema)
async def create_ziyaretci_kaydi(
    ziyaretci: ZiyaretciKaydiCreate,
    db: AsyncSession = Depends(get_db)
):
    # Check if the searched person exists
    result = await db.execute(
        select(DefinKaydi).where(
            DefinKaydi.ad_soyad.ilike(f"%{ziyaretci.aranan_kisi}%")
        )
    )
    bulundu = result.scalar_one_or_none() is not None
    
    # Create visitor record
    db_ziyaretci = ZiyaretciKaydi(
        **ziyaretci.dict(),
        bulundu_mu=bulundu
    )
    db.add(db_ziyaretci)
    await db.commit()
    await db.refresh(db_ziyaretci)
    return db_ziyaretci

@router.get("/", response_model=List[ZiyaretciKaydiSchema])
async def get_ziyaretci_kayitlari(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ZiyaretciKaydi)
        .order_by(ZiyaretciKaydi.ziyaret_tarihi.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

@router.get("/istatistik")
async def get_ziyaretci_istatistikleri(db: AsyncSession = Depends(get_db)):
    # Today's visitors
    today = datetime.now().date()
    today_start = datetime.combine(today, datetime.min.time())
    
    # Get statistics
    bugun_result = await db.execute(
        select(func.count(ZiyaretciKaydi.id)).where(
            ZiyaretciKaydi.ziyaret_tarihi >= today_start
        )
    )
    bugun_ziyaretci = bugun_result.scalar()
    
    # This week's visitors
    week_start = today - timedelta(days=today.weekday())
    week_start_datetime = datetime.combine(week_start, datetime.min.time())
    
    hafta_result = await db.execute(
        select(func.count(ZiyaretciKaydi.id)).where(
            ZiyaretciKaydi.ziyaret_tarihi >= week_start_datetime
        )
    )
    hafta_ziyaretci = hafta_result.scalar()
    
    # Success rate
    toplam_result = await db.execute(select(func.count(ZiyaretciKaydi.id)))
    toplam_ziyaretci = toplam_result.scalar()
    
    basarili_result = await db.execute(
        select(func.count(ZiyaretciKaydi.id)).where(
            ZiyaretciKaydi.bulundu_mu == True
        )
    )
    basarili_arama = basarili_result.scalar()
    
    basari_orani = (basarili_arama / toplam_ziyaretci * 100) if toplam_ziyaretci > 0 else 0
    
    return {
        "bugun_ziyaretci": bugun_ziyaretci,
        "hafta_ziyaretci": hafta_ziyaretci,
        "toplam_ziyaretci": toplam_ziyaretci,
        "basari_orani": round(basari_orani, 2)
    }