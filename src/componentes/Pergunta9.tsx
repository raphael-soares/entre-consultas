import { dataCurta } from '@/dominio/hoje'
import { OPCOES } from '@/dominio/phq9'
import { ESTILO_PERGUNTA9 } from '@/lib/pergunta9'
import { cn } from '@/lib/utils'

function Quadrado({ valor, className }: { valor: number; className?: string }) {
  const { fundo, borda } = ESTILO_PERGUNTA9[valor]
  return (
    <span
      aria-hidden
      className={cn('inline-block size-3.5 shrink-0 rounded-[3px] border-[1.5px]', className)}
      style={{ backgroundColor: fundo, borderColor: borda }}
    />
  )
}

export function LegendaPergunta9() {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
      {OPCOES.map((opcao, valor) => (
        <li key={opcao} className="flex items-center gap-1.5">
          <Quadrado valor={valor} />
          {opcao}
        </li>
      ))}
    </ul>
  )
}

export function QuadradosPergunta9({ historico }: { historico: { data: string; valor: number }[] }) {
  if (!historico.length) return null
  return (
    <div className="flex flex-col gap-1">
      <ol className="flex flex-wrap gap-1">
        {historico.map((h) => (
          <li key={h.data} title={`${dataCurta(h.data)}: ${OPCOES[h.valor].toLowerCase()}`}>
            <Quadrado valor={h.valor} className="size-5 rounded" />
            <span className="sr-only">
              {dataCurta(h.data)}: {OPCOES[h.valor].toLowerCase()}
            </span>
          </li>
        ))}
      </ol>
      <p aria-hidden className="flex justify-between text-[12px] text-muted-foreground">
        <span>{dataCurta(historico[0].data)}</span>
        {historico.length > 1 && <span>{dataCurta(historico.at(-1)!.data)}</span>}
      </p>
    </div>
  )
}
