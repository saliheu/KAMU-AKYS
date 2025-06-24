import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getCurrentLocation } from '../../utils/permissions';
import { mapService } from '../../services/mapService';
import { CollectionPoint } from '../../types';

export const MapScreen = () => {
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    initializeMap();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      loadCollectionPoints();
    }
  }, [currentLocation, selectedFilter]);

  const initializeMap = async () => {
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCollectionPoints = async () => {
    try {
      const points = await mapService.getNearbyCollectionPoints(
        currentLocation!.latitude,
        currentLocation!.longitude,
        selectedFilter === 'all' ? undefined : selectedFilter
      );
      setCollectionPoints(points);
    } catch (error) {
      console.error('Failed to load collection points:', error);
    }
  };

  const wasteTypeFilters = [
    { id: 'all', name: 'Tümü', icon: 'filter-alt', color: '#666' },
    { id: 'plastic', name: 'Plastik', icon: 'recycling', color: '#2196F3' },
    { id: 'paper', name: 'Kağıt', icon: 'description', color: '#8BC34A' },
    { id: 'glass', name: 'Cam', icon: 'wine-bar', color: '#00BCD4' },
    { id: 'metal', name: 'Metal', icon: 'build', color: '#FF9800' },
    { id: 'electronic', name: 'Elektronik', icon: 'devices', color: '#9C27B0' },
  ];

  const getMarkerColor = (wasteTypes: string[]) => {
    if (wasteTypes.length > 3) return '#4CAF50';
    if (wasteTypes.includes('electronic')) return '#9C27B0';
    if (wasteTypes.includes('metal')) return '#FF9800';
    if (wasteTypes.includes('glass')) return '#00BCD4';
    if (wasteTypes.includes('paper')) return '#8BC34A';
    if (wasteTypes.includes('plastic')) return '#2196F3';
    return '#4CAF50';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Harita yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {wasteTypeFilters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              selectedFilter === filter.id && styles.selectedFilterButton,
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Icon name={filter.icon} size={20} color={filter.color} />
            <Text style={[
              styles.filterText,
              selectedFilter === filter.id && styles.selectedFilterText,
            ]}>
              {filter.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={
          currentLocation
            ? {
                ...currentLocation,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }
            : {
                latitude: 41.0082,
                longitude: 28.9784,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }
        }
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {collectionPoints.map((point) => (
          <Marker
            key={point.id}
            coordinate={{
              latitude: point.location.latitude,
              longitude: point.location.longitude,
            }}
            title={point.name}
            description={point.address}
            onPress={() => setSelectedPoint(point)}
            pinColor={getMarkerColor(point.wasteTypes)}
          />
        ))}
      </MapView>

      {selectedPoint && (
        <View style={styles.pointDetails}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedPoint(null)}
          >
            <Icon name="close" size={24} color="#666" />
          </TouchableOpacity>

          <Text style={styles.pointName}>{selectedPoint.name}</Text>
          <Text style={styles.pointAddress}>{selectedPoint.address}</Text>

          <View style={styles.wasteTypesContainer}>
            {selectedPoint.wasteTypes.map((type) => {
              const filter = wasteTypeFilters.find((f) => f.id === type);
              return filter ? (
                <View key={type} style={styles.wasteTypeChip}>
                  <Icon name={filter.icon} size={16} color={filter.color} />
                  <Text style={styles.wasteTypeText}>{filter.name}</Text>
                </View>
              ) : null;
            })}
          </View>

          <View style={styles.capacityContainer}>
            <Text style={styles.capacityLabel}>Doluluk:</Text>
            <View style={styles.capacityBar}>
              <View
                style={[
                  styles.capacityFill,
                  {
                    width: `${(selectedPoint.currentLoad / selectedPoint.capacity) * 100}%`,
                    backgroundColor:
                      selectedPoint.currentLoad / selectedPoint.capacity > 0.8
                        ? '#F44336'
                        : selectedPoint.currentLoad / selectedPoint.capacity > 0.5
                        ? '#FF9800'
                        : '#4CAF50',
                  },
                ]}
              />
            </View>
            <Text style={styles.capacityText}>
              {Math.round((selectedPoint.currentLoad / selectedPoint.capacity) * 100)}%
            </Text>
          </View>

          <TouchableOpacity style={styles.navigateButton}>
            <Icon name="directions" size={20} color="#fff" />
            <Text style={styles.navigateButtonText}>Yol Tarifi Al</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  filterContainer: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    zIndex: 1,
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedFilterButton: {
    backgroundColor: '#E8F5E9',
  },
  filterText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  selectedFilterText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
  pointDetails: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
  },
  pointName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  pointAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  wasteTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  wasteTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  wasteTypeText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#333',
  },
  capacityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  capacityLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  capacityBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
  },
  capacityText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  navigateButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
  },
  navigateButtonText: {
    marginLeft: 8,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});