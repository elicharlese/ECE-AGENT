import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export function FeaturePills() {
  return (
    <View style={styles.row} accessibilityRole="summary">
      <View style={styles.pill}>
        <View style={[styles.dot, { backgroundColor: '#22c55e' }]} />
        <Text style={styles.pillText}>Real-time Processing</Text>
      </View>
      <View style={styles.pill}>
        <View style={[styles.dot, { backgroundColor: '#3b82f6' }]} />
        <Text style={styles.pillText}>Multi-Modal AI</Text>
      </View>
      <View style={styles.pill}>
        <View style={[styles.dot, { backgroundColor: '#8b5cf6' }]} />
        <Text style={styles.pillText}>Enterprise Ready</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16 as unknown as number,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8 as unknown as number,
  },
  dot: { width: 8, height: 8, borderRadius: 9999 },
  pillText: { fontSize: 13, color: '#64748b' },
})
