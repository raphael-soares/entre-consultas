import { faixa } from '@/dominio/phq9'
import { cn } from '@/lib/utils'

export function BadgeFaixa({ pontuacao, className }: { pontuacao: number; className?: string }) {
  const f = faixa(pontuacao)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap',
        className,
      )}
      style={{ color: f.cor, borderColor: `${f.cor}66` }}
    >
      <span className="size-2 rounded-full" style={{ backgroundColor: f.cor }} aria-hidden />
      {f.nome}
    </span>
  )
}
