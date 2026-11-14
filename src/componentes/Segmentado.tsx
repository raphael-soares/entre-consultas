import { RadioGroup } from 'radix-ui'
import { cn } from '@/lib/utils'

export function Segmentado<T extends string>({
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
  return (
    <RadioGroup.Root
      aria-label={rotulo}
      aria-invalid={invalido}
      value={valor ?? ''}
      onValueChange={(v) => aoMudar(v as T)}
      className={cn(
        'inline-flex gap-0.5 rounded-xl bg-secondary p-0.5',
        invalido && 'ring-2 ring-destructive',
        className,
      )}
    >
      {opcoes.map((o) => (
        <RadioGroup.Item
          key={o.valor}
          value={o.valor}
          disabled={o.desabilitada}
          className="h-10 min-w-16 flex-1 rounded-[10px] px-4 text-[14px] font-medium whitespace-nowrap text-[#48484a] transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-card data-[state=checked]:font-semibold data-[state=checked]:text-foreground data-[state=checked]:shadow-sm"
        >
          {o.rotulo}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  )
}
