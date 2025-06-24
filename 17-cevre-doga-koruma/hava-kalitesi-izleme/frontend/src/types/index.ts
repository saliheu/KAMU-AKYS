export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'operator' | 'viewer';
  department?: string;
  isActive: boolean;
  lastLogin?: Date;
}

export interface Station {
  id: string;
  code: string;
  name: string;
  type: 'traffic' | 'industrial' | 'background' | 'rural';
  latitude: number;
  longitude: number;
  altitude?: number;
  address: string;
  city: string;
  district?: string;
  region: string;
  isActive: boolean;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  lastDataReceived?: Date;
  sensors?: Sensor[];
}

export interface Sensor {
  id: string;
  stationId: string;
  serialNumber: string;
  type: 'pm25' | 'pm10' | 'co' | 'no2' | 'so2' | 'o3' | 'temperature' | 'humidity' | 'pressure';
  manufacturer?: string;
  model?: string;
  unit: string;
  status: 'active' | 'inactive' | 'maintenance' | 'faulty';
  lastReading?: number;
  lastReadingTime?: Date;
}

export interface Measurement {
  id: string;
  stationId: string;
  timestamp: Date;
  pm25?: number;
  pm10?: number;
  co?: number;
  no2?: number;
  so2?: number;
  o3?: number;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  windSpeed?: number;
  windDirection?: number;
  aqi?: number;
  aqiCategory?: AQICategory;
  dominantPollutant?: string;
}

export type AQICategory = 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous';

export interface Alert {
  id: string;
  stationId: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  pollutant?: string;
  value?: number;
  threshold?: number;
  message: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'expired';
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  station?: Station;
}

export interface DashboardData {
  summary: {
    stations: {
      total: number;
      active: number;
      offline: number;
    };
    sensors: {
      total: number;
      active: number;
      inactive: number;
    };
    measurements: {
      today: number;
    };
    alerts: {
      active: number;
    };
  };
  currentStatus: Array<{
    stationId: string;
    stationName: string;
    city: string;
    region: string;
    status: string;
    latestMeasurement: Measurement | null;
  }>;
  aqiDistribution: Record<string, number>;
  recentAlerts: Alert[];
  regionalSummary: Array<{
    region: string;
    avgAqi: number;
    maxAqi: number;
    measurementCount: number;
  }>;
  lastUpdated: Date;
}

export interface MapData {
  id: string;
  name: string;
  position: {
    lat: number;
    lng: number;
  };
  type: string;
  status: string;
  measurement: Measurement | null;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
  }>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
  message?: string;
}