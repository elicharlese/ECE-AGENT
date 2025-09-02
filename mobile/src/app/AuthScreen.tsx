import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, Alert, Linking } from 'react-native'
import * as ExpoLinking from 'expo-linking'
import { useRNTheme, RNThemeToggle } from '@ece-agent/shared-ui/native'
import { supabase } from '../lib/supabase'

export type AuthScreenProps = {
  onSignedIn?: () => void
}

export function AuthScreen({ onSignedIn }: AuthScreenProps) {
  const { tokens, resolvedTheme } = useRNTheme()
  const [step, setStep] = useState<'email' | 'password'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) onSignedIn?.()
    })
    return () => listener.subscription.unsubscribe()
  }, [onSignedIn])

  // Handle OAuth PKCE deep links on native to complete sign-in
  useEffect(() => {
    const getParam = (urlStr: string, key: string) => {
      try {
        const [_, queryOrHash] = urlStr.split(/[?#]/)
        if (!queryOrHash) return null
        const pairs = queryOrHash.split('&')
        for (const p of pairs) {
          const [k, v] = p.split('=')
          if (decodeURIComponent(k) === key) return decodeURIComponent(v || '')
        }
        return null
      } catch {
        return null
      }
    }

    const handleUrl = async (url?: string | null) => {
      if (!url) return
      const code = getParam(url, 'code')
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(`?code=${encodeURIComponent(code)}`)
        if (!error && data?.session?.user) {
          onSignedIn?.()
        }
      }
    }

    // Initial launch URL
    Linking.getInitialURL().then((u) => handleUrl(u)).catch(() => {})
    // Subsequent URL events
    const sub = Linking.addEventListener('url', (evt) => handleUrl(evt.url))
    return () => {
      if (sub && typeof (sub as any).remove === 'function') {
        ;(sub as any).remove()
      }
    }
  }, [onSignedIn])

  const handleEmailSubmit = useCallback(() => {
    setError('')
    if (!email) {
      setError('Please enter your email address')
      return
    }
    setStep('password')
  }, [email])

  const handlePasswordSubmit = useCallback(async () => {
    setError('')
    if (!password) {
      setError('Please enter your password')
      return
    }
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error || !data.user) {
      setError('The email or password you entered is incorrect.')
      return
    }
    onSignedIn?.()
  }, [email, password, onSignedIn])

  const handleBackToEmail = useCallback(() => {
    setStep('email')
    setPassword('')
    setError('')
  }, [])

  const redirectTo = Platform.select({
    web: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
    default: ExpoLinking.createURL('auth-callback'),
  })

  const handleGoogleLogin = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const r = redirectTo
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: r }
      })
      if (error) throw error
    } catch (e: any) {
      // On Expo Go, OAuth may require extra config; provide a helpful hint
      console.warn('Google OAuth error:', e)
      Alert.alert('Google Sign-in', 'Google sign-in requires deep link setup. You can continue with email/password for now.')
    } finally {
      setLoading(false)
    }
  }, [redirectTo])

  const handleMagicLink = useCallback(async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }
    setLoading(true)
    setError('')
    const r = redirectTo
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: r }
    })
    setLoading(false)
    if (error) {
      setError('Failed to send magic link. Please try again.')
    } else {
      Alert.alert('Magic link sent', 'Check your email to continue login.')
    }
  }, [email, redirectTo])

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: tokens.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.headerRow}>
        <RNThemeToggle />
      </View>

      <View style={styles.centerWrap}>
        <View style={[styles.card, { backgroundColor: tokens.card, shadowColor: resolvedTheme === 'dark' ? '#000' : '#000' }]}> 
          <View style={styles.logoCircle}><Text style={styles.logoText}>A</Text></View>
          <Text style={[styles.title, { color: tokens.foreground }]}>Welcome to AGENT</Text>
          <Text style={[styles.subtitle, { color: tokens.subtleText }]}>Sign in to access your AI-powered workspace</Text>

          {step === 'email' ? (
            <View style={styles.formBlock}>
              <Text style={[styles.label, { color: tokens.subtleText }]}>Email address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                autoCapitalize="none"
                keyboardType="email-address"
                style={[
                  styles.input,
                  {
                    color: tokens.foreground,
                    borderColor: 'rgba(120,120,120,0.35)',
                    backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.06)' : '#fff',
                  },
                ]}
              />
              <TouchableOpacity
                style={[styles.primaryBtn]}
                onPress={handleEmailSubmit}
                disabled={loading || !email}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Continue</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formBlock}>
              <View style={styles.identityRow}>
                <View style={styles.identityAvatar}><Text style={styles.identityAvatarText}>{email.charAt(0).toUpperCase()}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.identityEmail, { color: tokens.foreground }]} numberOfLines={1}>{email}</Text>
                  <TouchableOpacity onPress={handleBackToEmail}><Text style={styles.identitySwitch}>Not you?</Text></TouchableOpacity>
                </View>
              </View>

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
                style={[
                  styles.input,
                  {
                    color: tokens.foreground,
                    borderColor: 'rgba(120,120,120,0.35)',
                    backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.06)' : '#fff',
                  },
                ]}
              />

              <TouchableOpacity style={styles.primaryBtn} onPress={handlePasswordSubmit} disabled={loading || !password}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Sign In</Text>}
              </TouchableOpacity>
            </View>
          )}

          {!!error && (
            <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>
          )}

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={[styles.dividerLabel, { color: tokens.subtleText }]}>Or continue with</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.outlineBtn} onPress={handleGoogleLogin} disabled={loading}>
            <Text style={[styles.outlineBtnText, { color: tokens.foreground }]}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleMagicLink} disabled={loading}>
            <Text style={styles.magicLink}>Send me a magic link instead</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: { paddingTop: 12, paddingRight: 12, alignItems: 'flex-end' },
  centerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowOpacity: 0.12,
    shadowOffset: { width: 1, height: 4 },
    shadowRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(120,120,120,0.2)'
  },
  logoCircle: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 10 },
  logoText: { color: '#fff', fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '600', textAlign: 'center', marginTop: 4 },
  subtitle: { fontSize: 13, textAlign: 'center', marginTop: 2, marginBottom: 6, opacity: 0.9 },
  formBlock: { width: '100%', marginTop: 12 },
  label: { fontSize: 13, marginBottom: 6 },
  input: { height: 48, paddingHorizontal: 12, borderWidth: 1, borderRadius: 12 },
  primaryBtn: { height: 48, borderRadius: 12, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  primaryBtnText: { color: '#fff', fontWeight: '600' },
  identityRow: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 12, backgroundColor: 'rgba(120,120,120,0.08)' },
  identityAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(120,120,120,0.35)', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  identityAvatarText: { color: '#333', fontWeight: '600' },
  identityEmail: { fontSize: 14, fontWeight: '600' },
  identitySwitch: { fontSize: 12, color: '#2563eb' },
  errorBox: { marginTop: 10, padding: 10, borderRadius: 10, backgroundColor: 'rgba(220,38,38,0.08)', borderWidth: 1, borderColor: 'rgba(220,38,38,0.35)' },
  errorText: { color: '#dc2626', fontSize: 12 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  divider: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(120,120,120,0.3)' },
  dividerLabel: { marginHorizontal: 8, fontSize: 12 },
  outlineBtn: { height: 46, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(120,120,120,0.35)', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  outlineBtnText: { fontWeight: '600' },
  magicLink: { marginTop: 10, fontSize: 12, color: '#2563eb', textAlign: 'center' },
})
