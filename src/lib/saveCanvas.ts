import { supabase } from '@/lib/supabaseClient'
import { Editor } from '@tldraw/tldraw'

/**
 * Saves the current tldraw canvas to Supabase.
 * The canvas is stored in the `canvases` table as JSONB.
 * Requires that the user is authenticated.
 */
export async function saveCanvas(editor: Editor, canvasId: string) {
  const userRes = await supabase.auth.getUser()
  const uid = userRes.data.user?.id
  if (!uid) {
    throw new Error('User not authenticated; cannot save canvas.')
  }

  // Get every record from the tldraw store and stringify it
  const json = JSON.stringify(editor.store.allRecords())

  const { error } = await supabase.from('canvases')
    .update({ data: json, updated_at: new Date().toISOString() })
    .eq('id', canvasId)

  if (error) {
    console.error('Failed to save canvas', error)
    throw error
  }
}
