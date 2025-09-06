import React from 'react'
import { View, StyleSheet } from 'react-native'
import { RNThemeToggle } from '@ece-agent/shared-ui/native'

export function NativeThemeToggle() {
  return (
    <View style={styles.container}>
      <RNThemeToggle />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
})
