import { AQICategory } from '../types';

export const getAQIColor = (aqi: number | undefined): string => {
  if (!aqi) return '#999';
  
  if (aqi <= 50) return '#00e400';
  if (aqi <= 100) return '#ffff00';
  if (aqi <= 150) return '#ff7e00';
  if (aqi <= 200) return '#ff0000';
  if (aqi <= 300) return '#8f3f97';
  return '#7e0023';
};

export const getAQICategory = (aqi: number | undefined): AQICategory => {
  if (!aqi) return 'good';
  
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy_sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'very_unhealthy';
  return 'hazardous';
};

export const getAQILabel = (category: AQICategory): string => {
  const labels: Record<AQICategory, string> = {
    good: 'İyi',
    moderate: 'Orta',
    unhealthy_sensitive: 'Hassas Gruplar İçin Sağlıksız',
    unhealthy: 'Sağlıksız',
    very_unhealthy: 'Çok Sağlıksız',
    hazardous: 'Tehlikeli',
  };
  
  return labels[category];
};

export const getAQIDescription = (category: AQICategory): string => {
  const descriptions: Record<AQICategory, string> = {
    good: 'Hava kalitesi tatmin edici ve hava kirliliği çok az risk oluşturuyor.',
    moderate: 'Hava kalitesi kabul edilebilir; ancak bazı kirleticiler hassas kişiler için sorun oluşturabilir.',
    unhealthy_sensitive: 'Hassas gruplar sağlık etkileri yaşayabilir. Genel halk etkilenmez.',
    unhealthy: 'Herkes sağlık etkileri yaşamaya başlayabilir; hassas gruplar daha ciddi etkiler yaşayabilir.',
    very_unhealthy: 'Sağlık uyarıları: herkes daha ciddi sağlık etkileri yaşayabilir.',
    hazardous: 'Acil durum koşulları: tüm popülasyon etkilenme olasılığı yüksek.',
  };
  
  return descriptions[category];
};

export const getAQIRecommendations = (category: AQICategory): string[] => {
  const recommendations: Record<AQICategory, string[]> = {
    good: [
      'Açık hava aktiviteleri için ideal koşullar.',
      'Pencerelerinizi açık tutabilirsiniz.',
    ],
    moderate: [
      'Olağandışı derecede hassas kişiler uzun süreli açık hava aktivitelerini sınırlandırmayı düşünebilir.',
    ],
    unhealthy_sensitive: [
      'Kalp veya akciğer hastalığı olan kişiler, yaşlılar ve çocuklar uzun süreli veya yoğun açık hava aktivitelerini sınırlandırmalı.',
    ],
    unhealthy: [
      'Herkes uzun süreli veya yoğun açık hava aktivitelerinden kaçınmalı.',
      'Hassas gruplar her türlü açık hava aktivitesinden kaçınmalı.',
    ],
    very_unhealthy: [
      'Herkes her türlü açık hava aktivitesinden kaçınmalı.',
      'Hassas gruplar kapalı alanda kalmalı ve aktivite seviyesini düşük tutmalı.',
    ],
    hazardous: [
      'Herkes açık hava aktivitelerinden kaçınmalı.',
      'Hassas gruplar kapalı alanda kalmalı ve aktiviteleri minimum seviyede tutmalı.',
      'Hava filtreleme sistemleri kullanın.',
    ],
  };
  
  return recommendations[category];
};

export const getPollutantUnit = (pollutant: string): string => {
  const units: Record<string, string> = {
    pm25: 'μg/m³',
    pm10: 'μg/m³',
    co: 'mg/m³',
    no2: 'μg/m³',
    so2: 'μg/m³',
    o3: 'μg/m³',
    temperature: '°C',
    humidity: '%',
    pressure: 'hPa',
    windSpeed: 'm/s',
  };
  
  return units[pollutant] || '';
};

export const formatPollutantName = (pollutant: string): string => {
  const names: Record<string, string> = {
    pm25: 'PM2.5',
    pm10: 'PM10',
    co: 'CO',
    no2: 'NO₂',
    so2: 'SO₂',
    o3: 'O₃',
    temperature: 'Sıcaklık',
    humidity: 'Nem',
    pressure: 'Basınç',
    windSpeed: 'Rüzgar Hızı',
    windDirection: 'Rüzgar Yönü',
  };
  
  return names[pollutant] || pollutant.toUpperCase();
};