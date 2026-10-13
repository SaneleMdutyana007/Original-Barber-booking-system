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
import type { CaseStudy } from '@/lib/types'

export default function AdminCaseStudies() {
  const qc = useQueryClient()
  const toast = useToast()
  const [editing, setEditing] = useState<Partial<CaseStudy> | null>(null)
  const { data, isLoading } = useQuery({
    queryKey: ['admin-cases'],
    queryFn: async () => (await supabase.from('case_studies').select('*').order('sort_order')).data as CaseStudy[],
  })
  const save = async () => {
    if (!editing) return
    const { id, ...rest } = editing as any
    const op = id ? supabase.from('case_studies').update(rest).eq('id', id)
                  : supabase.from('case_studies').insert(rest)
    const { error } = await op
    if (error) return toast.push(error.message, 'error')
    toast.push('Saved.', 'success'); setEditing(null)
    qc.invalidateQueries({ queryKey: ['admin-cases'] })
  }
  const del = async (r: CaseStudy) => {
    if (!confirm(`Delete "${r.title}"?`)) return
    const { error } = await supabase.from('case_studies').delete().eq('id', r.id)
    if (error) return toast.push(error.message, 'error')
    qc.invalidateQueries({ queryKey: ['admin-cases'] })
  }
  return (
    <>
      <GenericAdminTable
        title="Case Studies"
        rows={data} loading={isLoading}
        onCreate={() => setEditing({ title: '', slug: '', client_name: '', summary: '', body_html: '', image_alt: '', published: false, sort_order: 0 })}
        createLabel="Story"
        onEdit={(r) => setEditing({ ...r })}
        onDelete={del}
        columns={[
          { key: 'title', label: 'Title', render: (r) => r.title },
          { key: 'client', label: 'Client', render: (r) => r.client_name },
          { key: 'published', label: 'Published', render: (r) => r.published ? 'Yes' : 'No' },
        ]}
      />
      <Dialog open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit Story' : 'New Story'}>
        {editing && (
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={editing.title ?? ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
            <div><Label>Slug</Label><Input value={editing.slug ?? ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
            <div><Label>Client name</Label><Input value={editing.client_name ?? ''} onChange={(e) => setEditing({ ...editing, client_name: e.target.value })} /></div>
            <div><Label>Summary</Label><Textarea rows={2} value={editing.summary ?? ''} onChange={(e) => setEditing({ ...editing, summary: e.target.value })} /></div>
            <div><Label>Body (HTML)</Label><Textarea rows={6} value={editing.body_html ?? ''} onChange={(e) => setEditing({ ...editing, body_html: e.target.value })} /></div>
            <div><Label>Image alt text</Label><Input value={editing.image_alt ?? ''} onChange={(e) => setEditing({ ...editing, image_alt: e.target.value })} /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="pub" checked={!!editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
              <Label htmlFor="pub" className="!mb-0">Published</Label>
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