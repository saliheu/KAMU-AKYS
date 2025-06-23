from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.models import Mezarlik, Ada, Mezar, DefinKaydi, ZiyaretciKaydi

router = APIRouter()

@router.get("/genel-durum")
async def get_genel_durum(db: AsyncSession = Depends(get_db)):
    # Total cemeteries
    mezarlik_result = await db.execute(select(func.count(Mezarlik.id)))
    toplam_mezarlik = mezarlik_result.scalar()
    
    # Total graves
    mezar_result = await db.execute(select(func.count(Mezar.id)))
    toplam_mezar = mezar_result.scalar()
    
    # Occupied graves
    dolu_result = await db.execute(
        select(func.count(Mezar.id)).where(Mezar.durum == "dolu")
    )
    dolu_mezar = dolu_result.scalar()
    
    # Empty graves
    bos_result = await db.execute(
        select(func.count(Mezar.id)).where(Mezar.durum == "bos")
    )
    bos_mezar = bos_result.scalar()
    
    # Occupancy rate
    doluluk_orani = (dolu_mezar / toplam_mezar * 100) if toplam_mezar > 0 else 0
    
    return {
        "toplam_mezarlik": toplam_mezarlik,
        "toplam_mezar": toplam_mezar,
        "dolu_mezar": dolu_mezar,
        "bos_mezar": bos_mezar,
        "doluluk_orani": round(doluluk_orani, 2)
    }

@router.get("/defin-istatistikleri")
async def get_defin_istatistikleri(db: AsyncSession = Depends(get_db)):
    # This month's burials
    now = datetime.now()
    month_start = datetime(now.year, now.month, 1)
    
    ay_result = await db.execute(
        select(func.count(DefinKaydi.id)).where(
            DefinKaydi.defin_tarihi >= month_start.date()
        )
    )
    bu_ay_defin = ay_result.scalar()
    
    # This year's burials
    year_start = datetime(now.year, 1, 1)
    
    yil_result = await db.execute(
        select(func.count(DefinKaydi.id)).where(
            DefinKaydi.defin_tarihi >= year_start.date()
        )
    )
    bu_yil_defin = yil_result.scalar()
    
    # Monthly distribution for current year
    aylik_dagilim_result = await db.execute(
        select(
            extract('month', DefinKaydi.defin_tarihi).label('ay'),
            func.count(DefinKaydi.id).label('sayi')
        )
        .where(DefinKaydi.defin_tarihi >= year_start.date())
        .group_by(extract('month', DefinKaydi.defin_tarihi))
        .order_by('ay')
    )
    
    aylik_dagilim = [
        {"ay": int(row.ay), "sayi": row.sayi}
        for row in aylik_dagilim_result
    ]
    
    return {
        "bu_ay_defin": bu_ay_defin,
        "bu_yil_defin": bu_yil_defin,
        "aylik_dagilim": aylik_dagilim
    }

@router.get("/mezarlik/{mezarlik_id}/doluluk")
async def get_mezarlik_doluluk(mezarlik_id: int, db: AsyncSession = Depends(get_db)):
    # Get cemetery info
    mezarlik_result = await db.execute(
        select(Mezarlik).where(Mezarlik.id == mezarlik_id)
    )
    mezarlik = mezarlik_result.scalar_one_or_none()
    
    if not mezarlik:
        return {"error": "Mezarlık bulunamadı"}
    
    # Get ada statistics
    ada_result = await db.execute(
        select(
            Ada.ada_no,
            Ada.kapasite,
            Ada.dolu_sayisi
        )
        .where(Ada.mezarlik_id == mezarlik_id)
        .order_by(Ada.ada_no)
    )
    
    adalar = []
    for row in ada_result:
        doluluk_orani = (row.dolu_sayisi / row.kapasite * 100) if row.kapasite > 0 else 0
        adalar.append({
            "ada_no": row.ada_no,
            "kapasite": row.kapasite,
            "dolu_sayisi": row.dolu_sayisi,
            "bos_sayisi": row.kapasite - row.dolu_sayisi if row.kapasite else 0,
            "doluluk_orani": round(doluluk_orani, 2)
        })
    
    return {
        "mezarlik_adi": mezarlik.ad,
        "toplam_kapasite": mezarlik.kapasite,
        "toplam_dolu": mezarlik.dolu_sayisi,
        "genel_doluluk_orani": round((mezarlik.dolu_sayisi / mezarlik.kapasite * 100) if mezarlik.kapasite else 0, 2),
        "adalar": adalar
    }