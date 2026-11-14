import { useEffect, useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceArea, ReferenceDot, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartContainer, type ChartConfig } from '@/componentes/ui/chart'
import type { Lacuna } from '@/dominio/evolucao'
import { dataCurta, dataPorExtenso, paraTempo, somarDias } from '@/dominio/hoje'
import { CANAIS, FAIXAS, OPCOES, pontuacao } from '@/dominio/phq9'
import type { Canal, Resposta } from '@/dominio/tipos'
import { ESTILO_PERGUNTA9 } from '@/lib/pergunta9'
import { cn } from '@/lib/utils'
import { BadgeFaixa } from './BadgeFaixa'
import { EscalaPergunta9 } from './Pergunta9'
import { Segmentado } from './Segmentado'

interface Ponto {
  t: number
  id?: string
  pontuacao: number | null
  data?: string
  canal?: Canal
  pergunta9?: number
}

type Intervalo = '3m' | '6m' | 'tudo'

const INTERVALOS: { valor: Intervalo; rotulo: string }[] = [
  { valor: '3m', rotulo: '3 meses' },
  { valor: '6m', rotulo: '6 meses' },
  { valor: 'tudo', rotulo: 'Tudo' },
]
const DIAS_DO_INTERVALO: Record<Intervalo, number | null> = { '3m': 91, '6m': 182, tudo: null }

const config = { pontuacao: { label: 'Pontuação', color: 'var(--primary)' } } satisfies ChartConfig
const COR_LACUNA = '#8E8E93'
// A faixa da pergunta 9 ocupa a parte negativa do eixo, logo acima das datas.
const Y_PERGUNTA9 = -2.6

// R.F. 007: um ponto nulo no início de cada lacuna interrompe a linha (connectNulls desligado).
function montarPontos(respostas: Resposta[], lacunas: Lacuna[]): Ponto[] {
  const pontos: Ponto[] = respostas.map((r) => ({
    t: paraTempo(r.data),
    id: r.id,
    pontuacao: pontuacao(r.itens),
    data: r.data,
    canal: r.canal,
    pergunta9: r.itens[8],
  }))
  for (const l of lacunas) pontos.push({ t: paraTempo(l.de), pontuacao: null })
  return pontos.sort((a, b) => a.t - b.t)
}

export function GraficoEvolucao({
  respostas,
  lacunas,
  inicio,
  ate,
  selecionada,
  aoSelecionar,
}: {
  respostas: Resposta[]
  lacunas: Lacuna[]
  inicio: string
  ate: string
  selecionada?: string
  aoSelecionar?: (id: string) => void
}) {
  const [intervalo, setIntervalo] = useState<Intervalo>('tudo')
  const [sobre, setSobre] = useState<string>()

  const dias = DIAS_DO_INTERVALO[intervalo]
  const desde = dias === null || somarDias(ate, -dias) < inicio ? inicio : somarDias(ate, -dias)
  const visiveis = respostas.filter((r) => r.data >= desde)
  const lacunasVisiveis = lacunas
    .filter((l) => l.ate > desde)
    .map((l) => (l.de < desde ? { ...l, de: desde } : l))
  const pontos = montarPontos(visiveis, lacunasVisiveis)
  const ticks = visiveis.map((r) => paraTempo(r.data))

  const ultima = respostas.at(-1)
  const lida = respostas.find((r) => r.id === (sobre ?? selecionada)) ?? ultima
  const marcada = selecionada ?? lida?.id

  return (
    <figure className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[15px] font-semibold">Evolução</h2>
        <Segmentado rotulo="Período do gráfico" opcoes={INTERVALOS} valor={intervalo} aoMudar={setIntervalo} />
      </div>

      {lida && <Leitura resposta={lida} ehUltima={lida.id === ultima?.id} />}

      <ChartContainer config={config} className={cn('aspect-auto h-[240px] w-full', aoSelecionar && 'cursor-pointer')}>
        <LineChart
          data={pontos}
          margin={{ top: 12, right: 116, bottom: 4, left: -8 }}
          onClick={(estado) => {
            const id = pontos[Number(estado.activeTooltipIndex)]?.id
            if (id && aoSelecionar) aoSelecionar(id)
          }}
        >
          {FAIXAS.map((f) => (
            <ReferenceArea
              key={f.id}
              y1={f.min}
              y2={Math.min(f.max + 1, 27)}
              fill={f.cor}
              fillOpacity={0.12}
              stroke="none"
              ifOverflow="hidden"
              label={(props: { viewBox?: { x: number; y: number; width: number; height: number } }) => (
                <RotuloFaixa viewBox={props.viewBox} texto={f.nome} cor={f.cor} />
              )}
            />
          ))}
          {lacunasVisiveis.map((l) => (
            <ReferenceArea
              key={l.de}
              x1={paraTempo(l.de)}
              x2={paraTempo(l.ate)}
              fill={COR_LACUNA}
              fillOpacity={0.22}
              stroke={COR_LACUNA}
              strokeDasharray="4 4"
              ifOverflow="hidden"
              label={{ value: 'Sem resposta', position: 'insideTop', fill: '#3A3A3C', fontSize: 12, fontWeight: 600 }}
            />
          ))}
          {visiveis.map((r) => (
            <ReferenceDot
              key={r.id}
              x={paraTempo(r.data)}
              y={Y_PERGUNTA9}
              ifOverflow="visible"
              shape={(p: { cx?: number; cy?: number }) => <QuadradoPergunta9 cx={p.cx} cy={p.cy} valor={r.itens[8]} />}
            />
          ))}
          <CartesianGrid vertical={false} stroke="#00000014" />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={[paraTempo(desde), paraTempo(ate)]}
            ticks={ticks}
            tickFormatter={(t: number) => dataCurta(new Date(t).toISOString().slice(0, 10))}
            tick={{ fill: '#3A3A3C', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#C7C7CC' }}
          />
          <YAxis
            domain={[-5, 27]}
            ticks={[0, 5, 10, 15, 20, 27]}
            tick={{ fill: '#3A3A3C', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip content={<LeitorDoPonto aoMudar={setSobre} />} cursor={{ stroke: '#C7C7CC' }} />
          <Line
            dataKey="pontuacao"
            type="linear"
            stroke="var(--color-pontuacao)"
            strokeWidth={2.5}
            connectNulls={false}
            isAnimationActive={false}
            dot={(props) => <Marcador key={props.index} {...props} selecionado={props.payload?.id === marcada} />}
            activeDot={(props) => (
              <Marcador key={props.index} {...props} ativo selecionado={props.payload?.id === marcada} />
            )}
          />
        </LineChart>
      </ChartContainer>

      <figcaption className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-primary" aria-hidden /> Pontuação
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-5 border border-dashed border-[#8E8E93] bg-[#8E8E93]/25" aria-hidden /> Sem resposta
        </span>
        <span className="flex items-center gap-2">
          Pensamentos de se ferir:
          <EscalaPergunta9 />
        </span>
      </figcaption>
    </figure>
  )
}

function Leitura({ resposta, ehUltima }: { resposta: Resposta; ehUltima: boolean }) {
  const total = pontuacao(resposta.itens)
  const pensamentos = resposta.itens[8]
  return (
    <div className="flex min-h-[78px] flex-col gap-0.5">
      <p className="text-[12px] font-medium text-muted-foreground">{ehUltima ? 'Última resposta' : 'Resposta'}</p>
      <p className="flex items-baseline gap-3">
        <span className="text-[32px] leading-none font-bold tracking-tight tabular-nums">{total}</span>
        <BadgeFaixa pontuacao={total} className="text-[15px]" />
      </p>
      <p className="text-[13px] text-muted-foreground">
        {dataPorExtenso(resposta.data)} · {CANAIS[resposta.canal]}
        {pensamentos > 0 && (
          <span className="font-semibold text-risco"> · Pensou em se ferir: {OPCOES[pensamentos].toLowerCase()}</span>
        )}
      </p>
    </div>
  )
}

// Não desenha nada: só conta ao gráfico qual ponto está sob o cursor (ou no foco do teclado).
function LeitorDoPonto({
  active,
  payload,
  aoMudar,
}: {
  active?: boolean
  payload?: readonly { payload: Ponto }[]
  aoMudar: (id: string | undefined) => void
}) {
  const ponto = payload?.[0]?.payload
  const id = ponto?.id
  useEffect(() => {
    if (!active) aoMudar(undefined)
    else if (id) aoMudar(id)
  }, [active, id, aoMudar])
  return null
}

function RotuloFaixa({
  viewBox,
  texto,
  cor,
}: {
  viewBox?: { x: number; y: number; width: number; height: number }
  texto: string
  cor: string
}) {
  if (!viewBox) return null
  const linhas = texto.length > 12 ? texto.split(' ') : [texto]
  return (
    <text
      x={viewBox.x + viewBox.width + 14}
      y={viewBox.y + viewBox.height / 2 - (linhas.length - 1) * 7}
      textAnchor="start"
      dominantBaseline="middle"
      fill={cor}
      fontSize={12}
      fontWeight={600}
    >
      {linhas.map((linha, i) => (
        <tspan key={linha} x={viewBox.x + viewBox.width + 14} dy={i === 0 ? 0 : 14}>
          {linha}
        </tspan>
      ))}
    </text>
  )
}

function QuadradoPergunta9({ cx, cy, valor }: { cx?: number; cy?: number; valor: number }) {
  if (cx === undefined || cy === undefined) return null
  const { fundo, borda } = ESTILO_PERGUNTA9[valor]
  return <rect x={cx - 7} y={cy - 7} width={14} height={14} rx={3} fill={fundo} stroke={borda} strokeWidth={1.5} />
}

function Marcador({
  cx,
  cy,
  payload,
  ativo,
  selecionado,
}: {
  cx?: number
  cy?: number
  payload?: Ponto
  ativo?: boolean
  selecionado?: boolean
}) {
  if (cx === undefined || cy === undefined || payload?.pontuacao == null) return null
  const anel = selecionado && <circle cx={cx} cy={cy} r={13} fill="none" stroke="var(--foreground)" strokeWidth={2} />
  if (payload.pergunta9) {
    const r = ativo ? 10 : 8
    return (
      <g>
        {anel}
        <circle cx={cx} cy={cy} r={r} fill="var(--risco)" stroke="#fff" strokeWidth={2} />
        <text x={cx} y={cy + 0.5} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={11} fontWeight={700}>
          !
        </text>
      </g>
    )
  }
  return (
    <g>
      {anel}
      <circle cx={cx} cy={cy} r={ativo ? 7 : 5} fill="var(--primary)" stroke="#fff" strokeWidth={2} />
    </g>
  )
}
