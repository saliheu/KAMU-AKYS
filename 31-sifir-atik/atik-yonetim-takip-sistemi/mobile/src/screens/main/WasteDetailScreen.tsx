import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { wasteService } from '../../services/wasteService';
import { WasteEntry } from '../../types';
import { HomeStackParamList } from '../../navigation/MainNavigator';

type WasteDetailScreenRouteProp = RouteProp<HomeStackParamList, 'WasteDetail'>;

export const WasteDetailScreen = () => {
  const route = useRoute<WasteDetailScreenRouteProp>();
  const { wasteId } = route.params;
  const [wasteEntry, setWasteEntry] = useState<WasteEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWasteEntry();
  }, [wasteId]);

  const loadWasteEntry = async () => {
    try {
      const entry = await wasteService.getWasteEntry(wasteId);
      setWasteEntry(entry);
    } catch (error) {
      console.error('Failed to load waste entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'collected': return '#4CAF50';
      case 'processed': return '#2196F3';
      default: return '#FF9800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'collected': return 'Toplandı';
      case 'processed': return 'İşlendi';
      default: return 'Bekliyor';
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                   'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!wasteEntry) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={60} color="#ccc" />
        <Text style={styles.errorText}>Atık bilgisi bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(wasteEntry.status) }]}>
          <Text style={styles.statusText}>{getStatusText(wasteEntry.status)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.mainInfo}>
          <View style={[styles.iconContainer, { backgroundColor: wasteEntry.wasteType.color + '20' }]}>
            <Icon
              name={wasteEntry.wasteType.icon}
              size={40}
              color={wasteEntry.wasteType.color}
            />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.wasteTypeName}>{wasteEntry.wasteType.name}</Text>
            <Text style={styles.quantity}>
              {wasteEntry.quantity} {wasteEntry.unit}
            </Text>
            <Text style={styles.points}>+{wasteEntry.wasteType.points} puan</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tarih ve Saat</Text>
        <View style={styles.dateContainer}>
          <Icon name="access-time" size={20} color="#666" />
          <Text style={styles.dateText}>{formatDate(wasteEntry.createdAt)}</Text>
        </View>
      </View>

      {wasteEntry.photos && wasteEntry.photos.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fotoğraflar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {wasteEntry.photos.map((photo, index) => (
              <Image
                key={index}
                source={{ uri: photo }}
                style={styles.photo}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {wasteEntry.location && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Konum</Text>
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              region={{
                latitude: wasteEntry.location.latitude,
                longitude: wasteEntry.location.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: wasteEntry.location.latitude,
                  longitude: wasteEntry.location.longitude,
                }}
              />
            </MapView>
          </View>
          {wasteEntry.location.address && (
            <View style={styles.addressContainer}>
              <Icon name="location-on" size={20} color="#666" />
              <Text style={styles.addressText}>{wasteEntry.location.address}</Text>
            </View>
          )}
        </View>
      )}

      {wasteEntry.qrCode && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QR Kod</Text>
          <View style={styles.qrInfo}>
            <Icon name="qr-code" size={20} color="#666" />
            <Text style={styles.qrText}>{wasteEntry.qrCode}</Text>
          </View>
        </View>
      )}

      <View style={styles.timeline}>
        <Text style={styles.sectionTitle}>İşlem Geçmişi</Text>
        <View style={styles.timelineItem}>
          <View style={[styles.timelineDot, { backgroundColor: '#4CAF50' }]} />
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Atık eklendi</Text>
            <Text style={styles.timelineDate}>{formatDate(wasteEntry.createdAt)}</Text>
          </View>
        </View>
        {wasteEntry.status === 'collected' && (
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: '#2196F3' }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Atık toplandı</Text>
              <Text style={styles.timelineDate}>{formatDate(wasteEntry.updatedAt)}</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  mainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  infoContent: {
    flex: 1,
  },
  wasteTypeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  quantity: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  points: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  photo: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginRight: 10,
  },
  mapContainer: {
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  map: {
    flex: 1,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  qrInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  timeline: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 15,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  timelineDate: {
    fontSize: 12,
    color: '#999',
  },
});