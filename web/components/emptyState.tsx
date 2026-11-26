import type {LucideIcon} from 'lucide-react'

export function EmptyState({icon: Icon, title, description, onClear}: {
  icon: LucideIcon
  title: string
  description: string
  onClear?: () => void
}) {
  return <div className="bg-espresso/[.035] px-6 py-12 text-center">
    <Icon className="mx-auto mb-3 size-10 text-earth/70" strokeWidth={1.7} aria-hidden="true" />
    <p className="text-lg font-medium text-espresso">{title}</p>
    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-earth">{description}</p>
    {onClear && <button type="button" onClick={onClear} className="mt-4 min-h-11 cursor-pointer text-sm font-medium text-piramide hover:underline">Limpar filtros</button>}
  </div>
}
