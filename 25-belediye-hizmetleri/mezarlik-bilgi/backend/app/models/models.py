from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    defin_kayitlari = relationship("DefinKaydi", back_populates="kaydeden")

class Mezarlik(Base):
    __tablename__ = "mezarliklar"
    
    id = Column(Integer, primary_key=True, index=True)
    ad = Column(String, nullable=False)
    adres = Column(Text)
    il = Column(String)
    ilce = Column(String)
    kapasite = Column(Integer)
    dolu_sayisi = Column(Integer, default=0)
    latitude = Column(Float)
    longitude = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    adalar = relationship("Ada", back_populates="mezarlik")

class Ada(Base):
    __tablename__ = "adalar"
    
    id = Column(Integer, primary_key=True, index=True)
    mezarlik_id = Column(Integer, ForeignKey("mezarliklar.id"))
    ada_no = Column(String, nullable=False)
    kapasite = Column(Integer)
    dolu_sayisi = Column(Integer, default=0)
    
    mezarlik = relationship("Mezarlik", back_populates="adalar")
    mezarlar = relationship("Mezar", back_populates="ada")

class Mezar(Base):
    __tablename__ = "mezarlar"
    
    id = Column(Integer, primary_key=True, index=True)
    ada_id = Column(Integer, ForeignKey("adalar.id"))
    mezar_no = Column(String, nullable=False)
    durum = Column(String, default="bos")  # bos, dolu, rezerve
    latitude = Column(Float)
    longitude = Column(Float)
    
    ada = relationship("Ada", back_populates="mezarlar")
    defin_kayitlari = relationship("DefinKaydi", back_populates="mezar")

class DefinKaydi(Base):
    __tablename__ = "defin_kayitlari"
    
    id = Column(Integer, primary_key=True, index=True)
    mezar_id = Column(Integer, ForeignKey("mezarlar.id"))
    tc_no = Column(String)
    ad_soyad = Column(String, nullable=False)
    baba_adi = Column(String)
    anne_adi = Column(String)
    dogum_tarihi = Column(Date)
    olum_tarihi = Column(Date, nullable=False)
    defin_tarihi = Column(Date, nullable=False)
    olum_nedeni = Column(String)
    memleket = Column(String)
    yakin_ad_soyad = Column(String)
    yakin_telefon = Column(String)
    yakin_adres = Column(Text)
    notlar = Column(Text)
    kaydeden_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    mezar = relationship("Mezar", back_populates="defin_kayitlari")
    kaydeden = relationship("User", back_populates="defin_kayitlari")

class ZiyaretciKaydi(Base):
    __tablename__ = "ziyaretci_kayitlari"
    
    id = Column(Integer, primary_key=True, index=True)
    ad_soyad = Column(String, nullable=False)
    telefon = Column(String)
    aranan_kisi = Column(String, nullable=False)
    ziyaret_tarihi = Column(DateTime, default=datetime.utcnow)
    bulundu_mu = Column(Boolean, default=False)