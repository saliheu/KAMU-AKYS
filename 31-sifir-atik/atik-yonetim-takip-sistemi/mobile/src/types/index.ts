export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'citizen' | 'collector' | 'admin';
  token?: string;
}

export interface WasteEntry {
  id: string;
  userId: string;
  wasteType: WasteType;
  quantity: number;
  unit: 'kg' | 'litre' | 'adet';
  location: Location;
  photos: string[];
  qrCode?: string;
  status: 'pending' | 'collected' | 'processed';
  createdAt: Date;
  updatedAt: Date;
  syncStatus?: 'synced' | 'pending' | 'failed';
}

export interface WasteType {
  id: string;
  name: string;
  category: 'plastic' | 'paper' | 'glass' | 'metal' | 'organic' | 'electronic' | 'hazardous' | 'other';
  color: string;
  icon: string;
  points: number;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface CollectionPoint {
  id: string;
  name: string;
  address: string;
  location: Location;
  wasteTypes: string[];
  workingHours: WorkingHours;
  capacity: number;
  currentLoad: number;
}

export interface WorkingHours {
  monday: { open: string; close: string };
  tuesday: { open: string; close: string };
  wednesday: { open: string; close: string };
  thursday: { open: string; close: string };
  friday: { open: string; close: string };
  saturday: { open: string; close: string };
  sunday: { open: string; close: string };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'collection';
  read: boolean;
  createdAt: Date;
}