import React from 'react'
import { Pressable, Text, StyleSheet } from 'react-native'
import { useRNTheme } from './Provider'

export function RNThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useRNTheme()

  const cycleTheme = () => {
    if (theme === 'system') {
      setTheme('light')
    } else if (theme === 'light') {
      setTheme('dark')
    } else {
      setTheme('system')
    }
  }

  const getThemeLabel = () => {
    if (theme === 'system') {
      return `System (${resolvedTheme})`
    }
    return theme.charAt(0).toUpperCase() + theme.slice(1)
  }

  return (
    <Pressable style={styles.button} onPress={cycleTheme}>
      <Text style={styles.text}>{getThemeLabel()}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
})