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
import { RNThemeProvider, useRNTheme, RNThemeToggle } from '@ece-agent/shared-ui/native';
import * as SplashScreen from 'expo-splash-screen'
import { Splash } from './Splash'
import { AuthScreen } from './AuthScreen'
import { supabase } from '../lib/supabase'

const AppContent = () => {
  const { tokens, resolvedTheme } = useRNTheme();

  return (
    <>
      <StatusBar barStyle={resolvedTheme === 'dark' ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={{ flex: 1, backgroundColor: tokens.background }}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={[styles.scrollView, { backgroundColor: tokens.background }]}
        >
          <View style={{ paddingHorizontal: 12, paddingTop: 12, alignItems: 'flex-end' }}>
            <RNThemeToggle />
          </View>

          <View style={styles.section}>
            <Text style={[styles.textLg, { color: tokens.foreground }]}>ECE Agent</Text>
            <Text
              style={[styles.textXL, styles.appTitleText, { color: tokens.foreground }]}
              testID="heading"
              role="heading"
            >
              Mobile 👋
            </Text>
            <Text style={{ fontSize: 14, color: tokens.subtleText }}>
              Cross-platform experience powered by shared theme tokens.
            </Text>
          </View>

          <View style={[styles.section, styles.shadowBox, { backgroundColor: tokens.card }]}>
            <TouchableOpacity onPress={() => Linking.openURL('http://localhost:3000/messages')}>
              <Text style={[styles.textMd, styles.textCenter, { color: tokens.foreground }]}>Open Messages on Web</Text>
            </TouchableOpacity>
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
    <RNThemeProvider defaultTheme="system">
      {phase === 'splash' && <Splash onGetStarted={() => setPhase('auth')} />}
      {phase === 'auth' && <AuthScreen onSignedIn={() => setPhase('main')} />}
      {phase === 'main' && <AppContent />}
    </RNThemeProvider>
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
  },
  textCenter: { textAlign: 'center' },
  textMd: { fontSize: 18 },
  textLg: { fontSize: 24 },
  textXL: { fontSize: 48 },
  appTitleText: { paddingTop: 12, fontWeight: '500' },
});

export default App;
