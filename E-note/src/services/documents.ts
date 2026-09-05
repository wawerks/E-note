import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type DocumentRecord = {
  id: string
  user_id: string
  title: string
  file_name: string
  file_path: string
  file_type: string
  file_size: number
  created_at: string
  updated_at?: string | null
}

export function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes)) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, '_')
}

export async function getCurrentUser() {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!data.user) {
    throw new Error('No authenticated user found.')
  }

  return data.user
}

export async function listUserDocuments() {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data as DocumentRecord[]
}

export async function uploadDocument(file: File, title: string) {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  const user = await getCurrentUser()
  const documentId = crypto.randomUUID()
  const safeFileName = sanitizeFileName(file.name)
  const filePath = `${user.id}/${documentId}/${safeFileName}`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) {
    throw uploadError
  }

  const documentRecord = {
    id: documentId,
    user_id: user.id,
    title,
    file_name: file.name,
    file_path: filePath,
    file_type: file.type || 'application/octet-stream',
    file_size: file.size,
  }

  const { error: insertError } = await supabase.from('documents').insert(documentRecord)

  if (insertError) {
    throw insertError
  }

  return documentRecord
}

export function getUserDisplayName(user: User | null) {
  if (!user) {
    return 'User'
  }

  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    'User'
  )
}
