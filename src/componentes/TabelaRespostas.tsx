import { Check } from 'lucide-react'
import { dataCurta } from '@/dominio/hoje'
import { ESTRESSORES, OPCOES, PERGUNTAS, PERGUNTAS_CURTAS, pontuacao } from '@/dominio/phq9'
import type { Resposta } from '@/dominio/tipos'
import { cn } from '@/lib/utils'

const INTENSIDADE = ['text-muted-foreground', 'bg-primary/10', 'bg-primary/25', 'bg-primary/45 font-semibold']
const INTENSIDADE_RISCO = ['text-muted-foreground', 'bg-risco/15', 'bg-risco/30', 'bg-risco/50 font-semibold']

export function TabelaRespostas({
  respostas,
  indice,
  aoSelecionar,
}: {
  respostas: Resposta[]
  indice: number
  aoSelecionar: (id: string) => void
}) {
  const estressores = ESTRESSORES.filter((e) => respostas.some((r) => r.estressores.includes(e.id)))
  const celula = (i: number) =>
    cn(
      'h-7 cursor-pointer rounded-md text-center tabular-nums group-hover/linha:shadow-[inset_0_0_0_1.5px_rgb(19_81_180/0.55)]',
      i === indice && 'ring-[1.5px] ring-foreground ring-inset',
    )
  const linha = 'group/linha'
  const rotuloLinha = 'truncate rounded-md pr-2 pl-1.5 text-left group-hover/linha:bg-accent group-hover/linha:text-accent-foreground'
  const grupo = (titulo: string) => (
    <tr>
      <th colSpan={respostas.length + 1} scope="colgroup" className="pt-3 pb-1 text-left text-[12px] font-semibold text-muted-foreground">
        {titulo}
      </th>
    </tr>
  )

  return (
    <section className="rounded-xl bg-card px-5 py-4 ring-1 ring-border">
      <h2 className="text-[15px] font-semibold">Respostas ao longo do tempo</h2>
      <p className="text-[12px] text-muted-foreground">
        De 0 (nenhuma vez) a 3 (quase todos os dias). Escolha uma data para ver a resposta completa ao lado.
      </p>
      <table className="mt-2 w-full table-fixed border-separate border-spacing-0.5 text-[13px]">
        <thead>
          <tr>
            <th scope="col" className="w-[215px]">
              <span className="sr-only">Pergunta</span>
            </th>
            {respostas.map((r, i) => (
              <th key={r.id} scope="col" className="font-normal">
                <button
                  type="button"
                  aria-pressed={i === indice}
                  onClick={() => aoSelecionar(r.id)}
                  className={cn(
                    'h-11 w-full rounded-md text-[12px] tabular-nums transition-colors hover:bg-muted',
                    i === indice ? 'bg-foreground font-semibold text-background hover:bg-foreground' : 'text-muted-foreground',
                  )}
                >
                  {dataCurta(r.data)}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grupo('Sintomas')}
          {PERGUNTAS_CURTAS.map((rotulo, p) => (
            <tr key={rotulo} className={linha}>
              <th scope="row" title={PERGUNTAS[p]} className={cn(rotuloLinha, 'font-normal')}>
                <span className="text-muted-foreground tabular-nums">{p + 1}. </span>
                {rotulo}
              </th>
              {respostas.map((r, i) => {
                const valor = r.itens[p]
                return (
                  <td
                    key={r.id}
                    title={`${PERGUNTAS[p]}\n${dataCurta(r.data)}: ${OPCOES[valor].toLowerCase()}`}
                    onClick={() => aoSelecionar(r.id)}
                    className={cn(celula(i), (p === 8 ? INTENSIDADE_RISCO : INTENSIDADE)[valor])}
                  >
                    {valor}
                    <span className="sr-only">, {OPCOES[valor].toLowerCase()}</span>
                  </td>
                )
              })}
            </tr>
          ))}
          <tr className={linha}>
            <th scope="row" className={cn(rotuloLinha, 'font-semibold')}>
              Pontuação total
            </th>
            {respostas.map((r, i) => (
              <td key={r.id} onClick={() => aoSelecionar(r.id)} className={cn(celula(i), 'font-semibold')}>
                {pontuacao(r.itens)}
              </td>
            ))}
          </tr>
          {estressores.length > 0 && grupo('Estressores marcados')}
          {estressores.map((e) => (
            <tr key={e.id} className={linha}>
              <th scope="row" className={cn(rotuloLinha, 'font-normal')}>
                {e.nome}
              </th>
              {respostas.map((r, i) => {
                const marcado = r.estressores.includes(e.id)
                return (
                  <td
                    key={r.id}
                    title={`${e.nome}\n${dataCurta(r.data)}: ${marcado ? 'marcado' : 'não marcado'}`}
                    onClick={() => aoSelecionar(r.id)}
                    className={celula(i)}
                  >
                    {marcado ? <Check className="mx-auto size-4" aria-label="Marcado" /> : <span className="sr-only">Não marcado</span>}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
