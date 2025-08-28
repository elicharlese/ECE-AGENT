"use client"

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ProfileUpdateSchema, type ProfileUpdate } from '@/types/profile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UI_CONSTANTS } from '@/lib/ui-constants'
import { toast } from 'sonner'

const FormSchema = ProfileUpdateSchema.extend({
  // Allow empty strings from inputs and coerce to undefined for optional fields
  full_name: z.string().max(50).optional().or(z.literal('')).transform(v => (v === '' ? undefined : v)),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-z0-9_-]+$/i)
    .optional()
    .or(z.literal(''))
    .transform(v => (v === '' ? undefined : v)),
  avatar_url: z.string().url().optional().or(z.literal('')).transform(v => (v === '' ? undefined : v)),
  cover_url: z.string().url().optional().or(z.literal('')).transform(v => (v === '' ? undefined : v)),
  solana_address: z.string().min(32).max(128).optional().or(z.literal('')).transform(v => (v === '' ? undefined : v)),
})

export function ProfileSettings() {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      full_name: '',
      username: '',
      avatar_url: '',
      cover_url: '',
      solana_address: '',
    },
  })

  // Load current profile
  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const res = await fetch('/api/profile', { method: 'GET' })
        if (!res.ok) return
        const { data } = await res.json()
        if (ignore) return
        reset({
          full_name: data?.full_name ?? '',
          username: data?.username ?? '',
          avatar_url: data?.avatar_url ?? '',
          cover_url: data?.cover_url ?? '',
          solana_address: data?.solana_address ?? '',
        })
      } catch (e) {
        // no-op
      }
    })()
    return () => { ignore = true }
  }, [reset])

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setLoading(true)
    try {
      // Map to API shape (snake_case) - API also accepts camelCase but we keep consistency
      const payload: ProfileUpdate = {
        full_name: values.full_name,
        username: values.username?.toLowerCase(),
        avatar_url: values.avatar_url,
        cover_url: values.cover_url,
        solana_address: values.solana_address,
      }

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const msg = err?.error || 'Failed to update profile'
        toast.error(msg)
        return
      }

      toast.success('Profile updated')
      // refresh values from server
      const json = await res.json()
      reset({
        full_name: json.data?.full_name ?? '',
        username: json.data?.username ?? '',
        avatar_url: json.data?.avatar_url ?? '',
        cover_url: json.data?.cover_url ?? '',
        solana_address: json.data?.solana_address ?? '',
      })
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">Profile Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className={`grid ${UI_CONSTANTS.grid.cols2} gap-4`}>
          <div className="space-y-2">
            <Label htmlFor="full_name">Display name</Label>
            <Input id="full_name" placeholder="Your name" {...register('full_name')} />
            {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="your_handle" {...register('username')} />
            {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar_url">Avatar URL</Label>
            <Input id="avatar_url" placeholder="https://..." {...register('avatar_url')} />
            {errors.avatar_url && <p className="text-xs text-red-500">{errors.avatar_url.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_url">Cover URL</Label>
            <Input id="cover_url" placeholder="https://..." {...register('cover_url')} />
            {errors.cover_url && <p className="text-xs text-red-500">{errors.cover_url.message}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="solana_address">Solana Address</Label>
            <Input id="solana_address" placeholder="Your Solana wallet address" {...register('solana_address')} />
            {errors.solana_address && <p className="text-xs text-red-500">{errors.solana_address.message}</p>}
          </div>

          <div className="md:col-span-2 flex justify-end gap-2">
            <Button type="submit" disabled={loading || !isDirty}>{loading ? 'Saving...' : 'Save changes'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
