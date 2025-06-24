import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { wasteService } from '../../services/wasteService';
import { HomeStackParamList } from '../../navigation/MainNavigator';

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'HomeMain'>;

export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalWaste: 0,
    monthlyWaste: 0,
    totalPoints: 0,
    rank: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      if (user) {
        const userStats = await wasteService.getUserStats(user.id);
        setStats(userStats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const quickActions = [
    {
      id: '1',
      title: 'QR Kod Tara',
      icon: 'qr-code-scanner',
      color: '#4CAF50',
      screen: 'Scanner',
    },
    {
      id: '2',
      title: 'Atık Ekle',
      icon: 'add-circle',
      color: '#2196F3',
      screen: 'AddWaste',
    },
    {
      id: '3',
      title: 'Harita',
      icon: 'map',
      color: '#FF9800',
      screen: 'Map',
    },
    {
      id: '4',
      title: 'Geçmiş',
      icon: 'history',
      color: '#9C27B0',
      screen: 'History',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba, {user?.name || 'Kullanıcı'}!</Text>
          <Text style={styles.subtitle}>Bugün çevreye katkıda bulunun</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          style={styles.notificationButton}
        >
          <Icon name="notifications" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="delete" size={30} color="#4CAF50" />
          <Text style={styles.statValue}>{stats.totalWaste} kg</Text>
          <Text style={styles.statLabel}>Toplam Atık</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="calendar-today" size={30} color="#2196F3" />
          <Text style={styles.statValue}>{stats.monthlyWaste} kg</Text>
          <Text style={styles.statLabel}>Bu Ay</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="star" size={30} color="#FF9800" />
          <Text style={styles.statValue}>{stats.totalPoints}</Text>
          <Text style={styles.statLabel}>Puan</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="emoji-events" size={30} color="#9C27B0" />
          <Text style={styles.statValue}>{stats.rank}.</Text>
          <Text style={styles.statLabel}>Sıralama</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.quickActionCard, { backgroundColor: action.color + '20' }]}
              onPress={() => navigation.navigate(action.screen as any)}
            >
              <Icon name={action.icon} size={40} color={action.color} />
              <Text style={styles.quickActionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>İpuçları</Text>
        <View style={styles.tipCard}>
          <Icon name="lightbulb" size={24} color="#FF9800" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Günün İpucu</Text>
            <Text style={styles.tipText}>
              Plastik şişeleri sıkıştırarak atın, böylece geri dönüşüm 
              kutularında daha fazla yer açmış olursunuz!
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  notificationButton: {
    padding: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  statCard: {
    width: '50%',
    padding: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  section: {
    padding: 20,
    marginTop: 10,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  quickActionCard: {
    width: '48%',
    margin: '1%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  quickActionText: {
    marginTop: 10,
    fontSize: 14,
    color: '#333',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 10,
  },
  tipContent: {
    flex: 1,
    marginLeft: 15,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});