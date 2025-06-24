import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

export const QRScannerScreen = () => {
  const navigation = useNavigation();
  const [flashOn, setFlashOn] = useState(false);
  const [scanning, setScanning] = useState(true);

  const onSuccess = (e: any) => {
    setScanning(false);
    
    try {
      const qrData = JSON.parse(e.data);
      
      if (qrData.type === 'waste_point') {
        navigation.navigate('AddWaste' as any, { 
          collectionPointId: qrData.pointId,
          pointName: qrData.name,
        });
      } else if (qrData.type === 'waste_container') {
        navigation.navigate('AddWaste' as any, { 
          containerId: qrData.containerId,
          wasteType: qrData.wasteType,
        });
      } else {
        Alert.alert(
          'Geçersiz QR Kod',
          'Bu QR kod tanınmadı. Lütfen geçerli bir atık noktası QR kodu tarayın.',
          [{ text: 'Tamam', onPress: () => setScanning(true) }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Hata',
        'QR kod okunamadı. Lütfen tekrar deneyin.',
        [{ text: 'Tamam', onPress: () => setScanning(true) }]
      );
    }
  };

  return (
    <View style={styles.container}>
      {scanning ? (
        <QRCodeScanner
          onRead={onSuccess}
          flashMode={
            flashOn
              ? RNCamera.Constants.FlashMode.torch
              : RNCamera.Constants.FlashMode.off
          }
          topContent={
            <View style={styles.topContent}>
              <Text style={styles.title}>QR Kod Tarayın</Text>
              <Text style={styles.subtitle}>
                Atık noktası veya konteyner üzerindeki QR kodu tarayın
              </Text>
            </View>
          }
          bottomContent={
            <View style={styles.bottomContent}>
              <TouchableOpacity
                style={styles.flashButton}
                onPress={() => setFlashOn(!flashOn)}
              >
                <Icon
                  name={flashOn ? 'flash-on' : 'flash-off'}
                  size={30}
                  color="#fff"
                />
                <Text style={styles.flashText}>
                  {flashOn ? 'Flash Kapat' : 'Flash Aç'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.manualButton}
                onPress={() => navigation.navigate('AddWaste' as any)}
              >
                <Text style={styles.manualButtonText}>
                  QR Kod Olmadan Devam Et
                </Text>
              </TouchableOpacity>
            </View>
          }
          showMarker={true}
          markerStyle={styles.marker}
        />
      ) : (
        <View style={styles.processingContainer}>
          <Icon name="check-circle" size={80} color="#4CAF50" />
          <Text style={styles.processingText}>QR Kod başarıyla okundu!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  bottomContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  flashButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 20,
  },
  flashText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  manualButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  manualButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  marker: {
    borderColor: '#4CAF50',
    borderWidth: 3,
    borderRadius: 10,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  processingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
});