import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { GraficoEvolucao } from '@/componentes/GraficoEvolucao'
import { TabelaRespostas } from '@/componentes/TabelaRespostas'
import { Button } from '@/componentes/ui/button'
import { nomeDoUsuario } from '@/dados/fixtures'
import { dataCurta, dataLonga } from '@/dominio/hoje'
import { COMO_RESPONDEU, ENUNCIADO, OPCOES, PERGUNTAS, faixa, nomeEstressor, pontuacao } from '@/dominio/phq9'
import type { Resposta } from '@/dominio/tipos'
import type { Ficha } from '@/estado/consultas'
import { cn } from '@/lib/utils'

const PARAMETRO = 'resposta'

export function PainelEvolucao({
  ficha,
  ate,
  lateral,
  inspetor = false,
}: {
  ficha: Pick<Ficha, 'respostas' | 'lacunas' | 'acompanhamento'>
  ate: string
  lateral: ReactNode
  // As respostas item a item são só do psiquiatra; a equipe da unidade vê o total.
  inspetor?: boolean
}) {
  const [params, setParams] = useSearchParams()
  const { respostas } = ficha
  const pedida = respostas.findIndex((r) => r.id === params.get(PARAMETRO))
  const indice = pedida >= 0 ? pedida : respostas.length - 1
  const comInspetor = inspetor && respostas.length > 0
  const selecionar = (id: string) =>
    setParams(
      (atual) => {
        const proximo = new URLSearchParams(atual)
        proximo.set(PARAMETRO, id)
        return proximo
      },
      { replace: true },
    )

  const grafico = (
    <section className="min-w-0 rounded-xl bg-card px-5 py-4 ring-1 ring-border">
      {respostas.length === 0 && <h2 className="mb-2 text-[15px] font-semibold">Evolução</h2>}
      {respostas.length ? (
        <GraficoEvolucao
          respostas={respostas}
          lacunas={ficha.lacunas}
          inicio={ficha.acompanhamento.inicio}
          ate={ate}
          selecionada={comInspetor ? respostas[indice].id : undefined}
          aoSelecionar={comInspetor ? selecionar : undefined}
        />
      ) : (
        <p className="py-10 text-center text-muted-foreground">O gráfico aparece depois da primeira resposta.</p>
      )}
    </section>
  )

  if (!comInspetor) {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-4">
        {grafico}
        <div className="flex flex-col gap-4">{lateral}</div>
      </div>
    )
  }
  return (
    <>
      {grafico}
      <TabelaRespostas respostas={respostas} indice={indice} aoSelecionar={selecionar} />
      {lateral}
      <InspetorResposta respostas={respostas} indice={indice} irPara={(i) => selecionar(respostas[i].id)} />
    </>
  )
}

function InspetorResposta({
  respostas,
  indice,
  irPara,
}: {
  respostas: Resposta[]
  indice: number
  irPara: (indice: number) => void
}) {
  const resposta = respostas[indice]
  const anterior = respostas[indice - 1] as Resposta | undefined
  const total = pontuacao(resposta.itens)
  const f = faixa(total)
  const variacao = anterior ? total - pontuacao(anterior.itens) : null
  const estressores = resposta.estressores
    .map((e) => (e === 'outro' && resposta.outroEstressor ? `Outro: ${resposta.outroEstressor}` : nomeEstressor(e)))
    .join(', ')

  return (
    <aside
      data-inspetor
      aria-label="Respostas do questionário"
      className="fixed top-12 right-0 bottom-0 z-30 flex w-[400px] flex-col border-l bg-card"
    >
      <div className="flex items-center gap-1 border-b px-2 py-1">
        <Button variant="ghost" size="icon" aria-label="Resposta anterior" disabled={indice === 0} onClick={() => irPara(indice - 1)}>
          <ChevronLeft aria-hidden />
        </Button>
        <div className="flex-1 text-center" aria-live="polite">
          <h2 className="text-[15px] leading-tight font-semibold">{dataLonga(resposta.data)}</h2>
          <p className="text-[12px] text-muted-foreground tabular-nums">
            Resposta {indice + 1} de {respostas.length}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Próxima resposta"
          disabled={indice === respostas.length - 1}
          onClick={() => irPara(indice + 1)}
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pt-4 pb-20">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[15px]">
              <span className="text-[28px] font-bold tabular-nums">{total}</span>{' '}
              <span className="font-semibold" style={{ color: f.cor }}>
                {f.nome}
              </span>
            </p>
            <p className="text-right text-[13px] text-muted-foreground">
              {variacao === null
                ? 'Primeira resposta'
                : variacao === 0
                  ? `Igual à de ${dataCurta(anterior!.data)}`
                  : `${variacao > 0 ? 'Subiu' : 'Caiu'} ${Math.abs(variacao)} desde ${dataCurta(anterior!.data)}`}
            </p>
          </div>
          <p className="text-[13px] text-muted-foreground">
            {COMO_RESPONDEU[resposta.canal]}
            {resposta.registradoPor && `, por ${nomeDoUsuario(resposta.registradoPor)}`}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[13px] text-muted-foreground">{ENUNCIADO}</p>
          <ol className="flex flex-col divide-y rounded-lg ring-1 ring-border">
            {PERGUNTAS.map((pergunta, i) => {
              const valor = resposta.itens[i]
              const risco = i === 8 && valor > 0
              return (
                <li key={pergunta} className="flex flex-col gap-1 px-3 py-2.5">
                  <p className="text-[13px] leading-snug">
                    <span className="text-muted-foreground tabular-nums">{i + 1}. </span>
                    {pergunta}
                  </p>
                  <p className={cn('flex flex-wrap items-center gap-x-1 text-[14px] font-semibold', risco && 'text-risco')}>
                    {OPCOES[valor]}
                    <Mudanca de={anterior?.itens[i]} para={valor} />
                  </p>
                </li>
              )
            })}
          </ol>
        </div>

        <div>
          <p className="text-[13px] text-muted-foreground">Estressores marcados</p>
          <p className="text-[14px]">{estressores || 'Nenhum'}</p>
        </div>
      </div>
    </aside>
  )
}

function Mudanca({ de, para }: { de: number | undefined; para: number }) {
  if (de === undefined || de === para) return null
  const Icone = para > de ? ArrowUp : ArrowDown
  return (
    <span className="ml-1 flex items-center gap-0.5 text-[12px] font-medium text-muted-foreground">
      <Icone className="size-3.5" aria-hidden />
      antes: {OPCOES[de].toLowerCase()}
    </span>
  )
}
