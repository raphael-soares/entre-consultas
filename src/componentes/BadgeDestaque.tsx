import { CircleCheck, Clock, Send, TrendingUp, TriangleAlert, type LucideIcon } from 'lucide-react'
import { nomeDestaque, type DestaqueId } from '@/dominio/destaques'
import { cn } from '@/lib/utils'

const ESTILO: Record<DestaqueId | 'em-dia' | 'encaminhado', { icone: LucideIcon; classe: string }> = {
  risco: { icone: TriangleAlert, classe: 'bg-risco text-white' },
  piorou: { icone: TrendingUp, classe: 'bg-[#FDECE2] text-[#9A3412]' },
  'sem-resposta': { icone: Clock, classe: 'bg-[#E9E9EF] text-[#3A3A3C]' },
  'sugere-encaminhamento': { icone: Send, classe: 'bg-accent text-accent-foreground' },
  'em-dia': { icone: CircleCheck, classe: 'bg-[#E3F2E8] text-[#17672F]' },
  encaminhado: { icone: Send, classe: 'bg-[#E9E9EF] text-[#3A3A3C]' },
}

export function BadgeDestaque({
  id,
  texto,
  className,
}: {
  id: DestaqueId | 'em-dia' | 'encaminhado'
  texto?: string
  className?: string
}) {
  const { icone: Icone, classe } = ESTILO[id]
  const rotulo = texto ?? (id === 'em-dia' ? 'Em dia' : id === 'encaminhado' ? 'Encaminhado' : nomeDestaque(id))
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold whitespace-nowrap',
        classe,
        className,
      )}
    >
      <Icone className="size-3.5" aria-hidden />
      {rotulo}
    </span>
  )
}
