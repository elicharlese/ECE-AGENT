import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRNTheme } from '@ece-agent/shared-ui/native'

export function Splash({ onGetStarted }: { onGetStarted?: () => void }) {
  const { tokens } = useRNTheme()

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.background }]}> 
      <View style={styles.container}>
        <Text style={[styles.kicker, { color: tokens.subtleText }]}>Realtime • Secure • Multi‑agent</Text>
        <Text style={[styles.title, { color: tokens.foreground }]}>The Complete
          <Text style={[styles.titleAccent, { color: tokens.foreground }]}> web3 </Text>
          development framework.
        </Text>
        <Text style={[styles.subtitle, { color: tokens.subtleText }]}>Everything you need to connect your apps to decentralized networks and AI‑powered agents.</Text>
        {onGetStarted && (
          <TouchableOpacity style={styles.cta} onPress={onGetStarted}>
            <Text style={styles.ctaText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  kicker: { fontSize: 14, marginBottom: 12 },
  title: { fontSize: 34, fontWeight: '700', lineHeight: 40 },
  titleAccent: { fontWeight: '800' },
  subtitle: { fontSize: 16, marginTop: 14 },
  cta: { marginTop: 18, alignSelf: 'flex-start', backgroundColor: '#7c3aed', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  ctaText: { color: '#fff', fontWeight: '600', fontSize: 14 },
})
