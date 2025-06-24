import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-picker';
import { useNetworkState } from 'react-native-offline';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { wasteService } from '../../services/wasteService';
import { getCurrentLocation } from '../../utils/permissions';
import { WasteType } from '../../types';

export const AddWasteScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { saveWasteEntry } = useDatabase();
  const { isConnected } = useNetworkState();
  
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<'kg' | 'litre' | 'adet'>('kg');
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  useEffect(() => {
    loadWasteTypes();
    getLocation();
  }, []);

  const loadWasteTypes = async () => {
    try {
      const types = await wasteService.getWasteTypes();
      setWasteTypes(types);
    } catch (error) {
      const defaultTypes: WasteType[] = [
        { id: '1', name: 'Plastik', category: 'plastic', color: '#2196F3', icon: 'recycling', points: 10 },
        { id: '2', name: 'Kağıt', category: 'paper', color: '#8BC34A', icon: 'description', points: 8 },
        { id: '3', name: 'Cam', category: 'glass', color: '#00BCD4', icon: 'wine-bar', points: 12 },
        { id: '4', name: 'Metal', category: 'metal', color: '#FF9800', icon: 'build', points: 15 },
        { id: '5', name: 'Organik', category: 'organic', color: '#4CAF50', icon: 'eco', points: 5 },
        { id: '6', name: 'Elektronik', category: 'electronic', color: '#9C27B0', icon: 'devices', points: 20 },
      ];
      setWasteTypes(defaultTypes);
    }
  };

  const getLocation = async () => {
    setFetchingLocation(true);
    try {
      const coords = await getCurrentLocation();
      setLocation(coords);
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setFetchingLocation(false);
    }
  };

  const selectPhoto = () => {
    const options = {
      title: 'Fotoğraf Seç',
      cancelButtonTitle: 'İptal',
      takePhotoButtonTitle: 'Fotoğraf Çek',
      chooseFromLibraryButtonTitle: 'Galeriden Seç',
      maxWidth: 1000,
      maxHeight: 1000,
      quality: 0.8,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel || response.error) {
        return;
      }

      if (response.uri) {
        setPhotos([...photos, response.uri]);
      }
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedType || !quantity) {
      Alert.alert('Hata', 'Lütfen atık türü ve miktar bilgilerini girin');
      return;
    }

    if (!location) {
      Alert.alert('Hata', 'Konum bilgisi alınamadı. Lütfen konum izinlerini kontrol edin');
      return;
    }

    setLoading(true);
    
    try {
      const wasteEntry = {
        id: new Date().getTime().toString(),
        userId: user?.id || '',
        wasteType: selectedType,
        quantity: parseFloat(quantity),
        unit,
        location,
        photos,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (isConnected) {
        const formData = new FormData();
        formData.append('userId', wasteEntry.userId);
        formData.append('wasteType', wasteEntry.wasteType);
        formData.append('quantity', wasteEntry.quantity.toString());
        formData.append('unit', wasteEntry.unit);
        formData.append('latitude', wasteEntry.location.latitude.toString());
        formData.append('longitude', wasteEntry.location.longitude.toString());
        
        photos.forEach((photo, index) => {
          formData.append('photos', {
            uri: photo,
            type: 'image/jpeg',
            name: `photo_${index}.jpg`,
          } as any);
        });

        await wasteService.createWasteEntry(formData);
      } else {
        await saveWasteEntry(wasteEntry);
        Alert.alert(
          'Offline Mod',
          'İnternet bağlantınız olmadığı için veriler cihazınıza kaydedildi. Bağlantı sağlandığında otomatik olarak senkronize edilecek.'
        );
      }

      Alert.alert(
        'Başarılı',
        'Atık girişi başarıyla kaydedildi!',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Atık Türü</Text>
        <View style={styles.wasteTypesGrid}>
          {wasteTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.wasteTypeCard,
                selectedType === type.id && styles.selectedWasteType,
                { borderColor: type.color },
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <Icon name={type.icon} size={30} color={type.color} />
              <Text style={styles.wasteTypeName}>{type.name}</Text>
              <Text style={styles.wasteTypePoints}>{type.points} puan</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Miktar</Text>
        <View style={styles.quantityContainer}>
          <TextInput
            style={styles.quantityInput}
            placeholder="0"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="decimal-pad"
          />
          <View style={styles.unitButtons}>
            {(['kg', 'litre', 'adet'] as const).map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.unitButton, unit === u && styles.selectedUnit]}
                onPress={() => setUnit(u)}
              >
                <Text style={[styles.unitText, unit === u && styles.selectedUnitText]}>
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fotoğraf (Opsiyonel)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={styles.addPhotoButton} onPress={selectPhoto}>
            <Icon name="add-a-photo" size={30} color="#666" />
            <Text style={styles.addPhotoText}>Fotoğraf Ekle</Text>
          </TouchableOpacity>
          
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photo} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => removePhoto(index)}
              >
                <Icon name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Konum</Text>
        {fetchingLocation ? (
          <ActivityIndicator size="small" color="#4CAF50" />
        ) : location ? (
          <View style={styles.locationInfo}>
            <Icon name="location-on" size={24} color="#4CAF50" />
            <Text style={styles.locationText}>Konum alındı</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.locationButton} onPress={getLocation}>
            <Icon name="my-location" size={24} color="#666" />
            <Text style={styles.locationButtonText}>Konumu Yenile</Text>
          </TouchableOpacity>
        )}
      </View>

      {!isConnected && (
        <View style={styles.offlineWarning}>
          <Icon name="cloud-off" size={20} color="#FF9800" />
          <Text style={styles.offlineText}>
            Çevrimdışı mod - Veriler daha sonra senkronize edilecek
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  wasteTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  wasteTypeCard: {
    width: '31%',
    margin: '1.16%',
    padding: 15,
    borderWidth: 2,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  selectedWasteType: {
    backgroundColor: '#E8F5E9',
  },
  wasteTypeName: {
    fontSize: 12,
    color: '#333',
    marginTop: 5,
  },
  wasteTypePoints: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 24,
    textAlign: 'center',
    marginRight: 10,
  },
  unitButtons: {
    flexDirection: 'row',
  },
  unitButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginLeft: 5,
  },
  selectedUnit: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  unitText: {
    color: '#666',
  },
  selectedUnitText: {
    color: '#fff',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addPhotoText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  photoContainer: {
    marginRight: 10,
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#F44336',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 10,
    color: '#4CAF50',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  locationButtonText: {
    marginLeft: 10,
    color: '#666',
  },
  offlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
  },
  offlineText: {
    marginLeft: 10,
    color: '#FF9800',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});