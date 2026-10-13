import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import GenericAdminTable from '@/components/GenericAdminTable'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import type { Barber } from '@/lib/types'

export default function AdminBarbers() {
  const qc = useQueryClient()
  const toast = useToast()
  const [editing, setEditing] = useState<Partial<Barber> | null>(null)
  const { data, isLoading } = useQuery({
    queryKey: ['admin-barbers'],
    queryFn: async () => (await supabase.from('barbers').select('*')).data as Barber[],
  })

  const save = async () => {
    if (!editing) return
    const { id, ...rest } = editing as any
    const op = id
      ? supabase.from('barbers').update(rest).eq('id', id)
      : supabase.from('barbers').insert(rest)
    const { error } = await op
    if (error) return toast.push(error.message, 'error')
    toast.push('Saved.', 'success'); setEditing(null)
    qc.invalidateQueries({ queryKey: ['admin-barbers'] })
  }

  const del = async (r: Barber) => {
    if (!confirm(`Delete ${r.display_name}?`)) return
    const { error } = await supabase.from('barbers').delete().eq('id', r.id)
    if (error) return toast.push(error.message, 'error')
    qc.invalidateQueries({ queryKey: ['admin-barbers'] })
  }

  return (
    <>
      <GenericAdminTable
        title="Barbers"
        rows={data} loading={isLoading}
        onCreate={() => setEditing({ display_name: '', bio: '', specialties: [], photo_alt: '', is_active: true })}
        createLabel="Barber"
        onEdit={(r) => setEditing({ ...r })}
        onDelete={del}
        columns={[
          { key: 'name', label: 'Name', render: (r) => r.display_name },
          { key: 'bio', label: 'Bio', render: (r) => <span className="line-clamp-1">{r.bio}</span> },
          { key: 'active', label: 'Active', render: (r) => r.is_active ? 'Yes' : 'No' },
        ]}
      />
      <Dialog open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit Barber' : 'New Barber'}>
        {editing && (
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={editing.display_name ?? ''} onChange={(e) => setEditing({ ...editing, display_name: e.target.value })} /></div>
            <div><Label>Bio</Label><Textarea rows={3} value={editing.bio ?? ''} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} /></div>
            <div><Label>Specialties (comma-separated)</Label><Input value={(editing.specialties ?? []).join(', ')} onChange={(e) => setEditing({ ...editing, specialties: e.target.value.split(',').map((x) => x.trim()) })} /></div>
            <div><Label>Photo alt text</Label><Input value={editing.photo_alt ?? ''} onChange={(e) => setEditing({ ...editing, photo_alt: e.target.value })} /></div>
            <div className="flex gap-2 pt-2">
              <Button onClick={save}>Save</Button>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  )
}