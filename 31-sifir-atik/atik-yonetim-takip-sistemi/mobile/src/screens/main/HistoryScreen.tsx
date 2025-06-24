import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { wasteService } from '../../services/wasteService';
import { WasteEntry } from '../../types';
import { HomeStackParamList } from '../../navigation/MainNavigator';

type HistoryScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'History'>;

export const HistoryScreen = () => {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const { user } = useAuth();
  const { getAllEntries } = useDatabase();
  const [entries, setEntries] = useState<WasteEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      // Try to load from API first
      if (user) {
        const apiEntries = await wasteService.getWasteEntries(user.id);
        setEntries(apiEntries);
      }
    } catch (error) {
      // Fallback to local database
      const localEntries = getAllEntries();
      setEntries(localEntries);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };

  const getWasteTypeIcon = (category: string) => {
    switch (category) {
      case 'plastic': return 'recycling';
      case 'paper': return 'description';
      case 'glass': return 'wine-bar';
      case 'metal': return 'build';
      case 'organic': return 'eco';
      case 'electronic': return 'devices';
      default: return 'delete';
    }
  };

  const getWasteTypeColor = (category: string) => {
    switch (category) {
      case 'plastic': return '#2196F3';
      case 'paper': return '#8BC34A';
      case 'glass': return '#00BCD4';
      case 'metal': return '#FF9800';
      case 'organic': return '#4CAF50';
      case 'electronic': return '#9C27B0';
      default: return '#666';
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const renderItem = ({ item }: { item: WasteEntry }) => (
    <TouchableOpacity
      style={styles.entryCard}
      onPress={() => navigation.navigate('WasteDetail', { wasteId: item.id })}
    >
      <View style={[styles.iconContainer, { backgroundColor: getWasteTypeColor(item.wasteType.category) + '20' }]}>
        <Icon
          name={getWasteTypeIcon(item.wasteType.category)}
          size={30}
          color={getWasteTypeColor(item.wasteType.category)}
        />
      </View>
      
      <View style={styles.entryInfo}>
        <View style={styles.entryHeader}>
          <Text style={styles.entryType}>{item.wasteType.name}</Text>
          {item.syncStatus === 'pending' && (
            <Icon name="cloud-upload" size={16} color="#FF9800" />
          )}
        </View>
        <Text style={styles.entryQuantity}>
          {item.quantity} {item.unit}
        </Text>
        <Text style={styles.entryDate}>{formatDate(item.createdAt)}</Text>
      </View>

      <View style={styles.entryStatus}>
        <View style={[styles.statusDot, {
          backgroundColor: item.status === 'collected' ? '#4CAF50' : 
                          item.status === 'processed' ? '#2196F3' : '#FF9800'
        }]} />
        <Text style={styles.statusText}>
          {item.status === 'collected' ? 'Toplandı' :
           item.status === 'processed' ? 'İşlendi' : 'Bekliyor'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="history" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Henüz atık girişi bulunmuyor</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddWaste' as any)}
            >
              <Text style={styles.addButtonText}>İlk Atığınızı Ekleyin</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 15,
  },
  entryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  entryInfo: {
    flex: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  entryType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  entryQuantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  entryDate: {
    fontSize: 12,
    color: '#999',
  },
  entryStatus: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 11,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
    marginBottom: 25,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});