import React from 'react'
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native'
import { useRNTheme } from './Provider'

export type RNThemeToggleProps = {
  variant?: 'chip' | 'text'
}

export function RNThemeToggle({ variant = 'chip' }: RNThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, tokens } = useRNTheme()

  const cycle = () => {
    if (theme === 'system') setTheme('light')
    else if (theme === 'light') setTheme('dark')
    else setTheme('system')
  }

  const label = theme === 'system' ? `System (${resolvedTheme})` : theme

  if (variant === 'text') {
    return (
      <TouchableOpacity onPress={cycle} accessibilityRole="button" accessibilityLabel="Toggle theme">
        <Text style={{ color: tokens.subtleText }}>Theme: {label}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity onPress={cycle} accessibilityRole="button" accessibilityLabel="Toggle theme">
      <View style={[styles.chip, { backgroundColor: tokens.card }]}> 
        <Text style={[styles.chipText, { color: tokens.surfaceText }]}>Theme: {label}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
})
