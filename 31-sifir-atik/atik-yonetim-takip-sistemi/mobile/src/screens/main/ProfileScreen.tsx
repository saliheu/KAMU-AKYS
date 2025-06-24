import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { syncService } from '../../services/syncService';

export const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const { getUnsyncedEntries } = useDatabase();
  const [syncing, setSyncing] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const handleSync = async () => {
    const unsyncedEntries = getUnsyncedEntries();
    if (unsyncedEntries.length === 0) {
      Alert.alert('Bilgi', 'Senkronize edilecek veri bulunmuyor.');
      return;
    }

    setSyncing(true);
    try {
      await syncService.syncOfflineData();
      Alert.alert('Başarılı', 'Tüm veriler başarıyla senkronize edildi!');
    } catch (error) {
      Alert.alert('Hata', 'Senkronizasyon sırasında bir hata oluştu.');
    } finally {
      setSyncing(false);
    }
  };

  const menuItems = [
    {
      id: '1',
      title: 'Profil Bilgileri',
      icon: 'person',
      screen: 'ProfileInfo',
    },
    {
      id: '2',
      title: 'Bildirim Ayarları',
      icon: 'notifications',
      screen: 'NotificationSettings',
    },
    {
      id: '3',
      title: 'Gizlilik ve Güvenlik',
      icon: 'security',
      screen: 'Privacy',
    },
    {
      id: '4',
      title: 'Yardım ve Destek',
      icon: 'help',
      screen: 'Help',
    },
    {
      id: '5',
      title: 'Hakkında',
      icon: 'info',
      screen: 'About',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.name ? (
            <Text style={styles.avatarText}>
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          ) : (
            <Icon name="person" size={40} color="#fff" />
          )}
        </View>
        <Text style={styles.userName}>{user?.name || 'Kullanıcı'}</Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>156</Text>
          <Text style={styles.statLabel}>Toplam Giriş</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>1,250</Text>
          <Text style={styles.statLabel}>Toplam Puan</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Sıralama</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.syncButton, syncing && styles.syncingButton]}
        onPress={handleSync}
        disabled={syncing}
      >
        <Icon name="sync" size={20} color="#fff" />
        <Text style={styles.syncButtonText}>
          {syncing ? 'Senkronize ediliyor...' : 'Verileri Senkronize Et'}
        </Text>
      </TouchableOpacity>

      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Icon name={item.icon} size={24} color="#666" />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={20} color="#F44336" />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Versiyon 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingVertical: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: -20,
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 15,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
  },
  syncingButton: {
    opacity: 0.6,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  logoutText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  version: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 30,
  },
});