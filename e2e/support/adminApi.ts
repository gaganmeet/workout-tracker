import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function loadEnv() {
  const envPath = path.resolve(import.meta.dirname, '../../.env')
  const parsed = Object.fromEntries(
    readFileSync(envPath, 'utf8')
      .split('\n')
      .filter((line) => line.includes('='))
      .map((line) => {
        const i = line.indexOf('=')
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()]
      }),
  )
  return { ...parsed, ...process.env }
}

const env = loadEnv()

if (!env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY is required to run e2e tests (creates/tears down test users). Add it to .env — see Project Settings > API in the Supabase dashboard.',
  )
}

export const supabaseAdmin = createClient(env.VITE_SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

export type Role = 'athlete' | 'coach'

export interface TestUser {
  id: string
  email: string
  password: string
  username: string
  displayName: string
  role: Role
}

export async function createTestUser(role: Role): Promise<TestUser> {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const email = `e2e-${role}-${unique}@example.com`
  const password = 'TestPass123!'
  const username = `e2e_${role}_${unique}`.slice(0, 30)
  const displayName = `E2E ${role === 'coach' ? 'Coach' : 'Athlete'} ${unique.slice(-4)}`

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username, display_name: displayName, role },
  })
  if (error) throw error

  return { id: data.user.id, email, password, username, displayName, role }
}

export async function deleteTestUser(userId: string) {
  await supabaseAdmin.auth.admin.deleteUser(userId)
}
