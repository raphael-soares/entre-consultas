import { CartesianGrid, Line, LineChart, ReferenceArea, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartContainer, type ChartConfig } from '@/componentes/ui/chart'
import type { Lacuna } from '@/dominio/evolucao'
import { dataCurta, dataLonga, paraTempo } from '@/dominio/hoje'
import { COMO_RESPONDEU, FAIXAS, OPCOES, faixa, pontuacao } from '@/dominio/phq9'
import type { Canal, Resposta } from '@/dominio/tipos'

interface Ponto {
  t: number
  pontuacao: number | null
  data?: string
  canal?: Canal
  pergunta9?: number
}

const config = { pontuacao: { label: 'Pontuação', color: 'var(--primary)' } } satisfies ChartConfig
const COR_LACUNA = '#8E8E93'

// R.F. 007: um ponto nulo no início de cada lacuna interrompe a linha (connectNulls desligado).
function montarPontos(respostas: Resposta[], lacunas: Lacuna[]): Ponto[] {
  const pontos: Ponto[] = respostas.map((r) => ({
    t: paraTempo(r.data),
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
}: {
  respostas: Resposta[]
  lacunas: Lacuna[]
  inicio: string
  ate: string
}) {
  const pontos = montarPontos(respostas, lacunas)
  const ticks = respostas.map((r) => paraTempo(r.data))

  return (
    <figure className="flex flex-col gap-3">
      <ChartContainer config={config} className="aspect-auto h-[320px] w-full">
        <LineChart data={pontos} margin={{ top: 12, right: 152, bottom: 4, left: -8 }}>
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
          {lacunas.map((l) => (
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
          <CartesianGrid vertical={false} stroke="#00000014" />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={[paraTempo(inicio), paraTempo(ate)]}
            ticks={ticks}
            tickFormatter={(t: number) => dataCurta(new Date(t).toISOString().slice(0, 10))}
            tick={{ fill: '#3A3A3C', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#C7C7CC' }}
          />
          <YAxis
            domain={[0, 27]}
            ticks={[0, 5, 10, 15, 20, 27]}
            tick={{ fill: '#3A3A3C', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip content={<DetalhePonto />} cursor={{ stroke: '#C7C7CC' }} />
          <Line
            dataKey="pontuacao"
            type="linear"
            stroke="var(--color-pontuacao)"
            strokeWidth={2.5}
            connectNulls={false}
            isAnimationActive={false}
            dot={(props) => <Marcador key={props.index} {...props} />}
            activeDot={(props) => <Marcador key={props.index} {...props} ativo />}
          />
        </LineChart>
      </ChartContainer>
      <figcaption className="flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-primary" aria-hidden /> Pontuação do PHQ-9 (0 a 27)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="grid size-4 place-items-center rounded-full bg-risco text-[10px] font-bold text-white" aria-hidden>
            !
          </span>
          Pergunta 9 positiva
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-5 border border-dashed border-[#8E8E93] bg-[#8E8E93]/25" aria-hidden /> Período sem
          resposta
        </span>
      </figcaption>
    </figure>
  )
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
  return (
    <text
      x={viewBox.x + viewBox.width + 10}
      y={viewBox.y + viewBox.height / 2}
      textAnchor="start"
      dominantBaseline="middle"
      fill={cor}
      fontSize={12}
      fontWeight={600}
      stroke="#fff"
      strokeWidth={4}
      paintOrder="stroke"
    >
      {texto}
    </text>
  )
}

function Marcador({
  cx,
  cy,
  payload,
  ativo,
}: {
  cx?: number
  cy?: number
  payload?: Ponto
  ativo?: boolean
}) {
  if (cx === undefined || cy === undefined || payload?.pontuacao == null) return null
  if (payload.pergunta9) {
    const r = ativo ? 10 : 8
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill="var(--risco)" stroke="#fff" strokeWidth={2} />
        <text x={cx} y={cy + 0.5} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={11} fontWeight={700}>
          !
        </text>
      </g>
    )
  }
  return <circle cx={cx} cy={cy} r={ativo ? 7 : 5} fill="var(--primary)" stroke="#fff" strokeWidth={2} />
}

function DetalhePonto({ active, payload }: { active?: boolean; payload?: { payload: Ponto }[] }) {
  const ponto = payload?.[0]?.payload
  if (!active || !ponto || ponto.pontuacao === null || !ponto.data || !ponto.canal) return null
  const f = faixa(ponto.pontuacao)
  return (
    <div className="flex min-w-48 flex-col gap-1 rounded-lg bg-card px-3 py-2 text-[13px] shadow-lg ring-1 ring-border">
      <p className="font-semibold">{dataLonga(ponto.data)}</p>
      <p>
        Pontuação <strong>{ponto.pontuacao}</strong>,{' '}
        <span className="font-semibold" style={{ color: f.cor }}>
          {f.nome.toLowerCase()}
        </span>
      </p>
      <p className="text-muted-foreground">{COMO_RESPONDEU[ponto.canal]}</p>
      {ponto.pergunta9 ? (
        <p className="font-semibold text-risco">Pergunta 9: {OPCOES[ponto.pergunta9].toLowerCase()}</p>
      ) : null}
    </div>
  )
}
