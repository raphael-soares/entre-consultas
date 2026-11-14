import type { RespostaTratamento } from '@/dominio/evolucao'
import { TEXTO_RESPOSTA_TRATAMENTO, textoVariacao } from '@/dominio/evolucao'
import { dataLonga } from '@/dominio/hoje'
import { COMO_RESPONDEU, pontuacao } from '@/dominio/phq9'
import type { Resposta } from '@/dominio/tipos'
import { BadgeFaixa } from './BadgeFaixa'

export function CartaoAgora({ ultima, tratamento }: { ultima?: Resposta; tratamento: RespostaTratamento }) {
  if (!ultima) {
    return (
      <section className="rounded-xl bg-card p-5 ring-1 ring-border">
        <h2 className="text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">Agora</h2>
        <p className="mt-2 text-[17px] font-semibold">Ainda sem respostas neste acompanhamento</p>
      </section>
    )
  }
  const atual = pontuacao(ultima.itens)
  return (
    <section className="grid grid-cols-[auto_1fr_1fr] gap-6 rounded-xl bg-card p-5 ring-1 ring-border">
      <div>
        <h2 className="text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">Agora</h2>
        <div className="mt-1 flex items-center gap-3">
          <span className="text-[44px] leading-none font-bold tracking-tight">{atual}</span>
          <BadgeFaixa pontuacao={atual} />
        </div>
        <p className="mt-2 text-[13px] text-muted-foreground">
          {dataLonga(ultima.data)} · {COMO_RESPONDEU[ultima.canal]}
        </p>
      </div>
      <div className="border-l pl-6">
        <p className="text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">Resposta ao tratamento</p>
        <p className="mt-2 text-[17px] font-semibold">{TEXTO_RESPOSTA_TRATAMENTO[tratamento.tipo]}</p>
      </div>
      <div className="border-l pl-6">
        <p className="text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">Desde o início</p>
        <p className="mt-2 text-[17px] font-semibold">
          {tratamento.inicial !== null && tratamento.atual !== null
            ? textoVariacao(tratamento.inicial, tratamento.atual)
            : 'Uma resposta só'}
        </p>
      </div>
    </section>
  )
}
