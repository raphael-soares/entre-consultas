import type { ReactNode } from 'react'
import { TEXTO_RESPOSTA_TRATAMENTO, textoVariacao } from '@/dominio/evolucao'
import { HOJE, dataRelativa, semanasEntre } from '@/dominio/hoje'
import { COMO_RESPONDEU, pontuacao } from '@/dominio/phq9'
import { lerPergunta9 } from '@/dominio/resumo'
import type { Ficha } from '@/estado/consultas'
import { cn } from '@/lib/utils'
import { BadgeFaixa } from './BadgeFaixa'

function Celula({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 border-l pl-4 first:border-l-0 first:pl-0">
      <p className="text-[12px] font-medium text-muted-foreground">{rotulo}</p>
      {children}
    </div>
  )
}

const Legenda = ({ children }: { children: ReactNode }) => (
  <p className="text-[12px] leading-snug text-muted-foreground">{children}</p>
)

const VALOR = 'text-[15px] leading-snug font-semibold'

export function CartaoAgora({ ficha }: { ficha: Ficha }) {
  const { ultima, tratamento, acompanhamento, respostas } = ficha
  const semanas = semanasEntre(acompanhamento.inicio, acompanhamento.encerramento?.data ?? HOJE)
  const pergunta9 = lerPergunta9(respostas.map((r) => ({ data: r.data, valor: r.itens[8] })))

  return (
    <section className="grid grid-cols-[1.3fr_1fr_1fr_1.3fr] gap-4 rounded-xl bg-card px-5 py-4 ring-1 ring-border">
      <Celula rotulo="Agora">
        {ultima ? (
          <>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-[32px] leading-none font-bold tracking-tight tabular-nums">
                {pontuacao(ultima.itens)}
              </span>
              <BadgeFaixa pontuacao={pontuacao(ultima.itens)} />
            </div>
            <Legenda>
              {dataRelativa(ultima.data)} · {COMO_RESPONDEU[ultima.canal]}
            </Legenda>
          </>
        ) : (
          <p className={VALOR}>Sem respostas</p>
        )}
      </Celula>
      <Celula rotulo="Resposta ao tratamento">
        <p className={VALOR}>{TEXTO_RESPOSTA_TRATAMENTO[tratamento.tipo]}</p>
        {tratamento.inicial !== null && tratamento.atual !== null && respostas.length > 1 && (
          <Legenda>{textoVariacao(tratamento.inicial, tratamento.atual)}</Legenda>
        )}
      </Celula>
      <Celula rotulo="Tempo de acompanhamento">
        <p className={VALOR}>
          {semanas} {semanas === 1 ? 'semana' : 'semanas'}
        </p>
        <Legenda>desde {dataRelativa(acompanhamento.inicio).toLowerCase()}</Legenda>
      </Celula>
      <Celula rotulo="Pensamentos de se ferir">
        <p className={cn(VALOR, pergunta9.positiva && 'text-risco')}>
          {pergunta9.titulo}
        </p>
        {pergunta9.detalhe && <Legenda>{pergunta9.detalhe}</Legenda>}
      </Celula>
    </section>
  )
}
