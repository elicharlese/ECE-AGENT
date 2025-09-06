import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export function InteractiveChatPreview() {
  return (
    <View style={styles.card} accessibilityRole="summary">
      <Text style={styles.header}>Chat Preview</Text>
      <View style={styles.bubbleRow}>
        <View style={[styles.bubble, styles.ai]}>
          <Text style={styles.bubbleText}>Hi! How can I automate my workflow?</Text>
        </View>
      </View>
      <View style={[styles.bubbleRow, { justifyContent: 'flex-end' }]}>
        <View style={[styles.bubble, styles.human]}>
          <Text style={[styles.bubbleText, { color: '#0f172a' }]}>Summarize my docs and create tasks.</Text>
        </View>
      </View>
      <View style={styles.bubbleRow}>
        <View style={[styles.bubble, styles.ai]}>
          <Text style={styles.bubbleText}>Done! I created 3 tasks and a summary.</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0b1220',
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  header: {
    color: '#e2e8f0',
    fontWeight: '700',
    marginBottom: 8,
  },
  bubbleRow: { flexDirection: 'row', marginVertical: 6 },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  ai: { backgroundColor: 'rgba(96,165,250,0.18)', borderTopLeftRadius: 4 },
  human: { backgroundColor: '#e2e8f0', borderTopRightRadius: 4 },
  bubbleText: { color: '#e2e8f0', fontSize: 14 },
})
