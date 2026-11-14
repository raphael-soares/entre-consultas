import { useId } from 'react'
import { RadioGroup, RadioGroupItem } from '@/componentes/ui/radio-group'
import { cn } from '@/lib/utils'

export function EscolhaUnica<T extends string>({
  opcoes,
  valor,
  aoMudar,
  rotulo,
  invalido,
  className,
}: {
  opcoes: { valor: T; rotulo: string; desabilitada?: boolean }[]
  valor: T | undefined
  aoMudar: (valor: T) => void
  rotulo: string
  invalido?: boolean
  className?: string
}) {
  const id = useId()
  return (
    <RadioGroup
      aria-label={rotulo}
      aria-invalid={invalido}
      value={valor ?? ''}
      onValueChange={(v) => aoMudar(v as T)}
      className={cn('grid gap-2', className)}
    >
      {opcoes.map((o) => (
        <label
          key={o.valor}
          htmlFor={`${id}-${o.valor}`}
          className={cn(
            'flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border bg-card px-3 py-2 text-[15px] transition-colors has-data-checked:border-primary has-data-checked:bg-accent has-data-checked:text-accent-foreground',
            invalido && 'border-destructive',
            o.desabilitada && 'cursor-not-allowed text-muted-foreground',
          )}
        >
          <RadioGroupItem id={`${id}-${o.valor}`} value={o.valor} disabled={o.desabilitada} />
          {o.rotulo}
        </label>
      ))}
    </RadioGroup>
  )
}
