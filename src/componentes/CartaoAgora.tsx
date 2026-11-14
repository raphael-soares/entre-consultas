import type { ReactNode } from 'react'
import { TEXTO_RESPOSTA_TRATAMENTO, textoVariacao } from '@/dominio/evolucao'
import { HOJE, dataLonga, semanasEntre } from '@/dominio/hoje'
import { COMO_RESPONDEU, pontuacao } from '@/dominio/phq9'
import { lerPergunta9 } from '@/dominio/resumo'
import type { Ficha } from '@/estado/consultas'
import { cn } from '@/lib/utils'
import { BadgeFaixa } from './BadgeFaixa'

function Celula({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 border-l pl-5 first:border-l-0 first:pl-0">
      <p className="text-[13px] font-medium text-muted-foreground">{rotulo}</p>
      {children}
    </div>
  )
}

const Legenda = ({ children }: { children: ReactNode }) => (
  <p className="text-[13px] leading-snug text-muted-foreground">{children}</p>
)

export function CartaoAgora({ ficha }: { ficha: Ficha }) {
  const { ultima, tratamento, acompanhamento, respostas } = ficha
  const semanas = semanasEntre(acompanhamento.inicio, acompanhamento.encerramento?.data ?? HOJE)
  const pergunta9 = lerPergunta9(respostas.map((r) => ({ data: r.data, valor: r.itens[8] })))

  return (
    <section className="grid grid-cols-4 gap-5 rounded-xl bg-card p-5 ring-1 ring-border">
      <Celula rotulo="Agora">
        {ultima ? (
          <>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-[40px] leading-none font-bold tracking-tight tabular-nums">
                {pontuacao(ultima.itens)}
              </span>
              <BadgeFaixa pontuacao={pontuacao(ultima.itens)} />
            </div>
            <Legenda>
              {dataLonga(ultima.data)} · {COMO_RESPONDEU[ultima.canal]}
            </Legenda>
          </>
        ) : (
          <p className="text-[17px] font-semibold">Sem respostas</p>
        )}
      </Celula>
      <Celula rotulo="Resposta ao tratamento">
        <p className="text-[17px] leading-snug font-semibold">{TEXTO_RESPOSTA_TRATAMENTO[tratamento.tipo]}</p>
        {tratamento.inicial !== null && tratamento.atual !== null && respostas.length > 1 && (
          <Legenda>{textoVariacao(tratamento.inicial, tratamento.atual)}</Legenda>
        )}
      </Celula>
      <Celula rotulo="Acompanhamento">
        <p className="text-[17px] leading-snug font-semibold">
          {semanas} {semanas === 1 ? 'semana' : 'semanas'}
        </p>
        <Legenda>desde {dataLonga(acompanhamento.inicio)}</Legenda>
      </Celula>
      <Celula rotulo="Pergunta 9">
        <p className={cn('text-[17px] leading-snug font-semibold', pergunta9.positiva && 'text-risco')}>
          {pergunta9.titulo}
        </p>
        {pergunta9.detalhe && <Legenda>{pergunta9.detalhe}</Legenda>}
      </Celula>
    </section>
  )
}
