import { dataCurta } from '@/dominio/hoje'
import { OPCOES, nomeEstressor } from '@/dominio/phq9'
import type { ResumoEncaminhamento } from '@/dominio/tipos'
import { cn } from '@/lib/utils'
import { BadgeFaixa } from './BadgeFaixa'

function Numero({ rotulo, valor }: { rotulo: string; valor: number | null }) {
  return (
    <div>
      <p className="text-[13px] text-muted-foreground">{rotulo}</p>
      <div className="mt-1 flex flex-col items-start gap-1.5">
        <span className="text-[28px] leading-none font-bold">{valor ?? '-'}</span>
        {valor !== null && <BadgeFaixa pontuacao={valor} />}
      </div>
    </div>
  )
}

// R.F. 008: o que sai do sistema; prejuízo funcional e tratamentos são do profissional.
export function ResumoGerado({ resumo }: { resumo: ResumoEncaminhamento }) {
  return (
    <div className="flex flex-col gap-5 text-[15px]">
      <div className="grid grid-cols-2 gap-4">
        <Numero rotulo="Pontuação inicial" valor={resumo.pontuacaoInicial} />
        <Numero rotulo="Pontuação atual" valor={resumo.pontuacaoAtual} />
      </div>
      <p>
        <span className="text-muted-foreground">Tempo de acompanhamento: </span>
        <strong>{resumo.semanas} semanas</strong>
      </p>
      <div>
        <p className="text-muted-foreground">Pergunta 9 (pensar em se ferir) ao longo do tempo</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {resumo.pergunta9.map((p) => (
            <li
              key={p.data}
              title={OPCOES[p.valor]}
              className={cn(
                'rounded-md px-2 py-1 text-[13px] font-medium',
                p.valor > 0 ? 'bg-risco text-white' : 'bg-secondary text-secondary-foreground',
              )}
            >
              {dataCurta(p.data)}: {p.valor > 0 ? OPCOES[p.valor].toLowerCase() : 'não'}
            </li>
          ))}
        </ul>
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
