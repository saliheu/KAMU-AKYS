import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NetworkProvider } from 'react-native-offline';
import PushNotification from 'react-native-push-notification';
import { AuthProvider } from './contexts/AuthContext';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { RootNavigator } from './navigation/RootNavigator';
import { requestPermissions } from './utils/permissions';

PushNotification.configure({
  onRegister: function (token) {
    console.log('TOKEN:', token);
  },
  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);
  },
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },
  popInitialNotification: true,
  requestPermissions: true,
});

const App = () => {
  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <SafeAreaProvider>
      <NetworkProvider>
        <DatabaseProvider>
          <AuthProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
        </DatabaseProvider>
      </NetworkProvider>
    </SafeAreaProvider>
  );
};

export default App;