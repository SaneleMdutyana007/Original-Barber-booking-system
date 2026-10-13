import { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'

interface Col<T> { key: string; label: string; render: (row: T) => ReactNode }
interface Props<T> {
  title: string
  rows: T[] | undefined
  loading: boolean
  columns: Col<T>[]
  onCreate?: () => void
  onEdit: (row: T) => void
  onDelete: (row: T) => void
  createLabel?: string
}

export default function GenericAdminTable<T extends { id: string }>({
  title, rows, loading, columns, onCreate, onEdit, onDelete, createLabel = 'New',
}: Props<T>) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-display">{title}</h1>
        {onCreate && (
          <button onClick={onCreate} className="rounded-lg bg-amber-500 px-3 py-2 text-sm text-white hover:bg-amber-600">
            + {createLabel}
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-charcoal/60">Loading…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/10 text-left">
                {columns.map((c) => <th key={c.key} className="py-2 pr-4 font-medium">{c.label}</th>)}
                <th className="py-2 pr-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((r) => (
                <tr key={r.id} className="border-b border-charcoal/5">
                  {columns.map((c) => <td key={c.key} className="py-3 pr-4">{c.render(r)}</td>)}
                  <td className="py-3 pr-4 space-x-2">
                    <button className="text-amber-500 underline" onClick={() => onEdit(r)}>Edit</button>
                    <button className="text-red-600 underline" onClick={() => onDelete(r)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}