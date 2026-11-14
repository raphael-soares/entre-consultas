import { nomeEstressor } from '@/dominio/phq9'
import { lerPergunta9 } from '@/dominio/resumo'
import type { ResumoEncaminhamento } from '@/dominio/tipos'
import { cn } from '@/lib/utils'
import { BadgeFaixa } from './BadgeFaixa'
import { QuadradosPergunta9 } from './Pergunta9'

function Numero({ rotulo, valor }: { rotulo: string; valor: number | null }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="whitespace-nowrap text-muted-foreground">{rotulo}</p>
      <div className="flex items-center gap-2">
        <span className="text-[24px] leading-none font-bold tabular-nums">{valor ?? '-'}</span>
        {valor !== null && <BadgeFaixa pontuacao={valor} className="text-[12px]" />}
      </div>
    </div>
  )
}

// R.F. 008: o que sai do sistema; prejuízo funcional e tratamentos são do profissional.
export function ResumoGerado({ resumo }: { resumo: ResumoEncaminhamento }) {
  const pergunta9 = lerPergunta9(resumo.pergunta9)
  return (
    <div className="flex flex-col gap-5 text-[15px]">
      <div className="flex flex-col gap-3">
        <Numero rotulo="Pontuação inicial" valor={resumo.pontuacaoInicial} />
        <Numero rotulo="Pontuação atual" valor={resumo.pontuacaoAtual} />
      </div>
      <p>
        <span className="text-muted-foreground">Tempo de acompanhamento: </span>
        <strong>{resumo.semanas} semanas</strong>
      </p>
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground">Pensamentos de se ferir</p>
        <div>
          <p className={cn('font-semibold', pergunta9.positiva && 'text-risco')}>{pergunta9.titulo}</p>
          {pergunta9.detalhe && <p className="text-[13px] text-muted-foreground">{pergunta9.detalhe}</p>}
        </div>
        <QuadradosPergunta9 historico={resumo.pergunta9} />
      </div>
      <div>
        <p className="text-muted-foreground">Estressores mais marcados</p>
        <p className="mt-1 font-medium">
          {resumo.estressores.length
            ? resumo.estressores.map((e) => `${nomeEstressor(e.estressor)} (${e.vezes})`).join(', ')
            : 'Nenhum'}
        </p>
      </div>
      <div>
        <p className="text-muted-foreground">Contexto social (e-SUS)</p>
        <p className="mt-1 font-medium">
          {resumo.contexto.escolaridade}. {resumo.contexto.trabalho}. Grupo comunitário:{' '}
          {resumo.contexto.grupoComunitario}.
        </p>
      </div>
    </div>
  )
}
