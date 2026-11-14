import { faixa } from '@/dominio/phq9'
import { cn } from '@/lib/utils'

const CURTO: Record<string, string> = { 'moderadamente-grave': 'Mod. grave' }

export function BadgeFaixa({
  pontuacao,
  curta,
  className,
}: {
  pontuacao: number
  curta?: boolean
  className?: string
}) {
  const f = faixa(pontuacao)
  const texto = curta ? (CURTO[f.id] ?? f.nome) : f.nome
  return (
    <span
      title={texto === f.nome ? undefined : f.nome}
      className={cn('inline-flex items-center gap-1.5 whitespace-nowrap text-muted-foreground', className)}
    >
      <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: f.cor }} aria-hidden />
      {texto}
    </span>
  )
}
