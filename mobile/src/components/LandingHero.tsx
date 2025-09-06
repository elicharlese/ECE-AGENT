import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { FeaturePills } from './FeaturePills'

export type LandingHeroProps = {
  onGetStarted?: () => void
  onViewDocs?: () => void
}

export function LandingHero({ onGetStarted, onViewDocs }: LandingHeroProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b1220' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <Text style={styles.titleLine1}>AI Agent</Text>
          <Text style={styles.titleLine2}>Ecosystem</Text>

          <Text style={styles.subtitle}>
            Build, deploy, and manage intelligent AI agents with our comprehensive platform. From
            conversational AI to autonomous workflows, create the future of intelligent automation.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={onGetStarted}
              style={[styles.button, styles.primary]}
            >
              <Text style={styles.primaryText}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              onPress={onViewDocs}
              style={[styles.button, styles.glass]}
            >
              <Text style={styles.glassText}>View Documentation</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 10 }}>
            <FeaturePills />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  content: {
    flex: 1,
  },
  titleLine1: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
  },
  titleLine2: {
    fontSize: 36,
    fontWeight: '700',
    color: '#60a5fa',
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    marginTop: 12,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12 as unknown as number,
    marginTop: 18,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primary: {
    backgroundColor: '#2563eb',
  },
  primaryText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  glass: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  glassText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
})
