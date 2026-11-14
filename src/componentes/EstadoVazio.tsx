import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function EstadoVazio({
  icone: Icone,
  titulo,
  texto,
  acao,
  className,
}: {
  icone: LucideIcon
  titulo: string
  texto?: string
  acao?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-12 text-center', className)}>
      <span className="grid size-14 place-items-center rounded-full bg-card text-muted-foreground ring-1 ring-border">
        <Icone className="size-7" aria-hidden />
      </span>
      <p className="text-[17px] font-semibold">{titulo}</p>
      {texto && <p className="max-w-sm text-[15px] text-muted-foreground">{texto}</p>}
      {acao}
    </div>
  )
}
