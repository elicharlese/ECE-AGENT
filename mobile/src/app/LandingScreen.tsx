import React from 'react'
import { Linking } from 'react-native'
import { LandingHero } from '../components/LandingHero'

export const LandingScreen = ({ navigation }: any) => {
  const openDocs = () => {
    const ports = ['3000', '3001', '3002']
    const baseUrl = `http://localhost`
    Linking.openURL(`${baseUrl}:${ports[0]}/design-system`).catch(() => {
      Linking.openURL(`${baseUrl}:${ports[1]}/design-system`).catch(() => {
        Linking.openURL(`${baseUrl}:${ports[2]}/design-system`).catch(() => {
          console.warn('Could not open documentation')
        })
      })
    })
  }

  return (
    <LandingHero
      onGetStarted={() => navigation.navigate('Messages')}
      onViewDocs={openDocs}
    />
  )
}
