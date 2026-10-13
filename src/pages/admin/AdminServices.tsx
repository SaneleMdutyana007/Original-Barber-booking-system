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
import { ZAR } from '@/lib/utils'
import type { Service } from '@/lib/types'

const blank = { name: '', slug: '', description: '', duration_minutes: 30, price_zar: 150, image_alt: '', is_active: true, sort_order: 0 }

export default function AdminServices() {
  const qc = useQueryClient()
  const toast = useToast()
  const [editing, setEditing] = useState<Partial<Service> | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => (await supabase.from('services').select('*').order('sort_order')).data as Service[],
  })

  const save = async () => {
    if (!editing) return
    const { id, ...rest } = editing as any
    if (id) {
      const { error } = await supabase.from('services').update(rest).eq('id', id)
      if (error) return toast.push(error.message, 'error')
    } else {
      const { error } = await supabase.from('services').insert(rest)
      if (error) return toast.push(error.message, 'error')
    }
    toast.push('Saved.', 'success'); setEditing(null)
    qc.invalidateQueries({ queryKey: ['admin-services'] })
  }

  const del = async (r: Service) => {
    if (!confirm(`Delete ${r.name}?`)) return
    const { error } = await supabase.from('services').delete().eq('id', r.id)
    if (error) return toast.push(error.message, 'error')
    qc.invalidateQueries({ queryKey: ['admin-services'] })
  }

  return (
    <>
      <GenericAdminTable
        title="Services"
        rows={data} loading={isLoading}
        onCreate={() => setEditing({ ...blank })}
        createLabel="Service"
        onEdit={(r) => setEditing({ ...r })}
        onDelete={del}
        columns={[
          { key: 'name', label: 'Name', render: (r) => r.name },
          { key: 'duration', label: 'Duration', render: (r) => `${r.duration_minutes} min` },
          { key: 'price', label: 'Price', render: (r) => ZAR(r.price_zar) },
          { key: 'active', label: 'Active', render: (r) => r.is_active ? 'Yes' : 'No' },
        ]}
      />

      <Dialog open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit Service' : 'New Service'}>
        {editing && (
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={editing.name ?? ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <div><Label>Slug</Label><Input value={editing.slug ?? ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea rows={3} value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Duration (min)</Label><Input type="number" value={editing.duration_minutes ?? 0} onChange={(e) => setEditing({ ...editing, duration_minutes: +e.target.value })} /></div>
              <div><Label>Price (ZAR)</Label><Input type="number" step="0.01" value={editing.price_zar ?? 0} onChange={(e) => setEditing({ ...editing, price_zar: +e.target.value })} /></div>
            </div>
            <div><Label>Image alt text</Label><Input value={editing.image_alt ?? ''} onChange={(e) => setEditing({ ...editing, image_alt: e.target.value })} /></div>
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