import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import Realm from 'realm';
import { WasteEntry } from '../types';

const WasteEntrySchema = {
  name: 'WasteEntry',
  primaryKey: 'id',
  properties: {
    id: 'string',
    userId: 'string',
    wasteType: 'string',
    quantity: 'double',
    unit: 'string',
    latitude: 'double',
    longitude: 'double',
    address: 'string?',
    photos: 'string[]',
    qrCode: 'string?',
    status: 'string',
    createdAt: 'date',
    updatedAt: 'date',
    syncStatus: { type: 'string', default: 'pending' },
  },
};

interface DatabaseContextType {
  realm: Realm | null;
  saveWasteEntry: (entry: Partial<WasteEntry>) => Promise<void>;
  getUnsyncedEntries: () => WasteEntry[];
  markAsSynced: (id: string) => void;
  getAllEntries: () => WasteEntry[];
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [realm, setRealm] = React.useState<Realm | null>(null);

  useEffect(() => {
    const initRealm = async () => {
      try {
        const realmInstance = await Realm.open({
          schema: [WasteEntrySchema],
          schemaVersion: 1,
        });
        setRealm(realmInstance);
      } catch (error) {
        console.error('Failed to initialize Realm:', error);
      }
    };

    initRealm();

    return () => {
      if (realm && !realm.isClosed) {
        realm.close();
      }
    };
  }, []);

  const saveWasteEntry = async (entry: Partial<WasteEntry>) => {
    if (!realm) return;

    try {
      realm.write(() => {
        realm.create('WasteEntry', {
          ...entry,
          id: entry.id || new Date().getTime().toString(),
          createdAt: entry.createdAt || new Date(),
          updatedAt: new Date(),
          syncStatus: 'pending',
        });
      });
    } catch (error) {
      console.error('Failed to save waste entry:', error);
      throw error;
    }
  };

  const getUnsyncedEntries = (): WasteEntry[] => {
    if (!realm) return [];
    
    const entries = realm.objects('WasteEntry').filtered('syncStatus = "pending"');
    return Array.from(entries) as unknown as WasteEntry[];
  };

  const markAsSynced = (id: string) => {
    if (!realm) return;

    try {
      realm.write(() => {
        const entry = realm.objectForPrimaryKey('WasteEntry', id);
        if (entry) {
          entry.syncStatus = 'synced';
        }
      });
    } catch (error) {
      console.error('Failed to mark as synced:', error);
    }
  };

  const getAllEntries = (): WasteEntry[] => {
    if (!realm) return [];
    
    const entries = realm.objects('WasteEntry').sorted('createdAt', true);
    return Array.from(entries) as unknown as WasteEntry[];
  };

  return (
    <DatabaseContext.Provider value={{ realm, saveWasteEntry, getUnsyncedEntries, markAsSynced, getAllEntries }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within DatabaseProvider');
  }
  return context;
};