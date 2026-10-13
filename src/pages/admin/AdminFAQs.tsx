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
import type { FAQ } from '@/lib/types'

export default function AdminFAQs() {
  const qc = useQueryClient(); const toast = useToast()
  const [editing, setEditing] = useState<Partial<FAQ> | null>(null)
  const { data, isLoading } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: async () => (await supabase.from('faqs').select('*').order('sort_order')).data as FAQ[],
  })
  const save = async () => {
    if (!editing) return
    const { id, ...rest } = editing as any
    const op = id ? supabase.from('faqs').update(rest).eq('id', id) : supabase.from('faqs').insert(rest)
    const { error } = await op
    if (error) return toast.push(error.message, 'error')
    toast.push('Saved.', 'success'); setEditing(null)
    qc.invalidateQueries({ queryKey: ['admin-faqs'] })
  }
  const del = async (r: FAQ) => {
    if (!confirm('Delete this FAQ?')) return
    const { error } = await supabase.from('faqs').delete().eq('id', r.id)
    if (error) return toast.push(error.message, 'error')
    qc.invalidateQueries({ queryKey: ['admin-faqs'] })
  }
  return (
    <>
      <GenericAdminTable
        title="FAQs"
        rows={data} loading={isLoading}
        onCreate={() => setEditing({ question: '', answer: '', category: 'General', sort_order: 0 })}
        createLabel="FAQ"
        onEdit={(r) => setEditing({ ...r })} onDelete={del}
        columns={[
          { key: 'q', label: 'Question', render: (r) => r.question },
          { key: 'cat', label: 'Category', render: (r) => r.category },
        ]}
      />
      <Dialog open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit FAQ' : 'New FAQ'}>
        {editing && (
          <div className="space-y-3">
            <div><Label>Question</Label><Input value={editing.question ?? ''} onChange={(e) => setEditing({ ...editing, question: e.target.value })} /></div>
            <div><Label>Answer</Label><Textarea rows={4} value={editing.answer ?? ''} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category</Label><Input value={editing.category ?? ''} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></div>
              <div><Label>Sort order</Label><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: +e.target.value })} /></div>
            </div>
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