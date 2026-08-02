import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use service role to delete user
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service not configured' }, { status: 503 })
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  )

  // Delete profile data first (cascade handles saves/swipes)
  await admin.from('profiles').delete().eq('id', user.id)

  // Delete auth user
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
