import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { HomeScreen } from '../screens/main/HomeScreen';
import { QRScannerScreen } from '../screens/main/QRScannerScreen';
import { AddWasteScreen } from '../screens/main/AddWasteScreen';
import { MapScreen } from '../screens/main/MapScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { HistoryScreen } from '../screens/main/HistoryScreen';
import { NotificationsScreen } from '../screens/main/NotificationsScreen';
import { WasteDetailScreen } from '../screens/main/WasteDetailScreen';

export type MainTabParamList = {
  Home: undefined;
  Scanner: undefined;
  AddWaste: undefined;
  Map: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  History: undefined;
  Notifications: undefined;
  WasteDetail: { wasteId: string };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <HomeStack.Screen 
        name="HomeMain" 
        component={HomeScreen}
        options={{ title: 'Sıfır Atık' }}
      />
      <HomeStack.Screen 
        name="History" 
        component={HistoryScreen}
        options={{ title: 'Geçmiş' }}
      />
      <HomeStack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ title: 'Bildirimler' }}
      />
      <HomeStack.Screen 
        name="WasteDetail" 
        component={WasteDetailScreen}
        options={{ title: 'Atık Detayı' }}
      />
    </HomeStack.Navigator>
  );
};

export const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Scanner':
              iconName = 'qr-code-scanner';
              break;
            case 'AddWaste':
              iconName = 'add-circle';
              break;
            case 'Map':
              iconName = 'map';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{ title: 'Ana Sayfa' }} />
      <Tab.Screen name="Scanner" component={QRScannerScreen} options={{ title: 'QR Tara' }} />
      <Tab.Screen name="AddWaste" component={AddWasteScreen} options={{ title: 'Atık Ekle' }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Harita' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
};