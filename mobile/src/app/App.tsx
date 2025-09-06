import 'react-native-gesture-handler'
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as SplashScreen from 'expo-splash-screen';
import { Splash } from './Splash';
import { AuthScreen } from './AuthScreen';
import { HomeScreen } from './HomeScreen';
import { LandingScreen } from './LandingScreen';
import { MessagesScreen } from './MessagesScreen';
import { ProfileScreen } from './ProfileScreen';
import { supabase } from '../lib/supabase';
import { RNThemeProvider } from '@ece-agent/shared-ui/native'

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e0e0e0',
        },
        headerStyle: {
          backgroundColor: '#f8f9fa',
        },
        headerTintColor: '#333',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={LandingScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => null,
          headerTitle: 'ECE Agent',
        }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Messages',
          tabBarIcon: () => null,
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => null,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

export const App = () => {
  const [phase, setPhase] = useState<'splash' | 'auth' | 'main'>('splash');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await SplashScreen.preventAutoHideAsync();
      } catch {}
      
      // Check auth session while keeping the native splash for a brief moment
      const { data: { session } } = await supabase.auth.getSession();
      setTimeout(async () => {
        if (!mounted) return;
        setPhase(session ? 'main' : 'auth');
        try { await SplashScreen.hideAsync(); } catch {}
      }, 400);
    })();
    return () => { mounted = false; };
  }, []);

  if (phase === 'splash') {
    return <Splash onGetStarted={() => setPhase('auth')} />;
  }

  return (
    <RNThemeProvider defaultTheme="system">
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {phase === 'auth' && (
            <Stack.Screen name="Auth">
              {() => <AuthScreen onSignedIn={() => setPhase('main')} />}
            </Stack.Screen>
          )}
          {phase === 'main' && (
            <Stack.Screen name="Main" component={MainTabNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </RNThemeProvider>
  );
};

export default App;
