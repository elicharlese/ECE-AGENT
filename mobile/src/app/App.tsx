/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Linking,
} from 'react-native';
// import { RNThemeProvider, useRNTheme, RNThemeToggle } from '../../../libs/shared-ui/src/native';
import * as SplashScreen from 'expo-splash-screen'
import { Splash } from './Splash'
import { AuthScreen } from './AuthScreen'
import { supabase } from '../lib/supabase'
import {
  Sheet
} from '@/libs/design-system';

const AppContent = () => {
  const openWebApp = (path: string = '') => {
    // Use correct Next.js web server ports - try common development ports
    const ports = ['3000', '3001', '3002'];
    const baseUrl = `http://localhost`;
    
    // Try the first port, fallback to others if needed
    Linking.openURL(`${baseUrl}:${ports[0]}${path}`).catch(() => {
      // If first port fails, try second port
      Linking.openURL(`${baseUrl}:${ports[1]}${path}`).catch(() => {
        // If second port fails, try third port
        Linking.openURL(`${baseUrl}:${ports[2]}${path}`).catch(() => {
          console.warn('Could not open web app - make sure Next.js dev server is running on port 3000, 3001, or 3002');
        });
      });
    });
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1, height: "100%", backgroundColor: '#ffffff' }}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={[styles.scrollView]}
        >
          <View style={styles.section}>
            <Text style={[styles.textLg]}>ECE Agent</Text>
            <Text
              style={[styles.textXL, styles.appTitleText]}
              testID="heading"
              role="heading"
            >
              Mobile 👋
            </Text>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
              Cross-platform AI agent ecosystem. Access the full web experience from your mobile device.
            </Text>
          </View>

          <View style={styles.section}>
            <TouchableOpacity 
              style={[styles.shadowBox, styles.primaryButton]} 
              onPress={() => openWebApp('/messages')}
            >
              <Text style={[styles.textMd, styles.textCenter, styles.buttonText]}>
                💬 Open Messages
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.shadowBox, styles.secondaryButton]} 
              onPress={() => openWebApp('/profile')}
            >
              <Text style={[styles.textMd, styles.textCenter]}>
                👤 Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.shadowBox, styles.secondaryButton]} 
              onPress={() => openWebApp('/')}
            >
              <Text style={[styles.textMd, styles.textCenter]}>
                🏠 Home
              </Text>
            </TouchableOpacity>

            <View style={[styles.infoBox]}>
              <Text style={[styles.textSm, styles.textCenter]}>
                📱 Mobile app connects to your web instance
              </Text>
              <Text style={[styles.textXs, styles.textCenter, { color: '#888', marginTop: 4 }]}>
                Make sure Next.js dev server is running on port 3000-3002
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  )
}

export const App = () => {
  const [phase, setPhase] = useState<'splash' | 'auth' | 'main'>('splash')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        await SplashScreen.preventAutoHideAsync()
      } catch {}
      // Check auth session while we keep the native splash for a brief moment
      const { data: { session } } = await supabase.auth.getSession()
      setTimeout(async () => {
        if (!mounted) return
        setPhase(session ? 'main' : 'auth')
        try { await SplashScreen.hideAsync() } catch {}
      }, 400)
    })()
    return () => { mounted = false }
  }, [])

  return (
    <>
      {phase === 'splash' && <Splash onGetStarted={() => setPhase('auth')} />}
      {phase === 'auth' && <AuthScreen onSignedIn={() => setPhase('main')} />}
      {phase === 'main' && <AppContent />}
    </>
  )
}
const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#ffffff',
  },
  section: {
    marginVertical: 12,
    marginHorizontal: 12,
  },
  shadowBox: {
    borderRadius: 16,
    shadowColor: 'black',
    shadowOpacity: 0.12,
    shadowOffset: { width: 1, height: 4 },
    shadowRadius: 12,
    padding: 20,
    backgroundColor: '#f0f0f0',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  textCenter: { textAlign: 'center' },
  textXs: { fontSize: 12 },
  textSm: { fontSize: 14 },
  textMd: { fontSize: 18 },
  textLg: { fontSize: 24 },
  textXL: { fontSize: 48 },
  appTitleText: { paddingTop: 12, fontWeight: '500' },
});

export default App;
