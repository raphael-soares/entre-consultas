import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { BadgeDestaque } from '@/componentes/BadgeDestaque'
import { DESTAQUES } from '@/dominio/destaques'
import { HOJE, dataCurta, dataPorExtenso, diasEntre } from '@/dominio/hoje'
import { faixa, pontuacao } from '@/dominio/phq9'
import { useListaDoResponsavel, type Ficha } from '@/estado/consultas'
import { useUsuarioLogado } from '@/estado/store'

const DIAS_A_FRENTE = 7

export function InicioEquipe() {
  const usuario = useUsuarioLogado()!
  const fichas = useListaDoResponsavel(usuario.id)
  const emDia = fichas.filter((f) => f.destaques.length === 0)
  const proximos = fichas
    .filter((f) => {
      const dias = diasEntre(HOJE, f.prevista)
      return dias >= 0 && dias <= DIAS_A_FRENTE
    })
    .sort((a, b) => a.prevista.localeCompare(b.prevista))

  return (
    <div className="flex flex-col gap-5 px-8 pt-5 pb-16">
      <header>
        <h1 className="text-[28px] leading-tight font-bold tracking-tight">Resumo do dia</h1>
        <p className="text-[13px] text-muted-foreground">
          {dataPorExtenso(HOJE)} · {fichas.length} em acompanhamento
        </p>
      </header>

      <div className="grid grid-cols-2 items-start gap-5">
        <div className="flex flex-col gap-5">
          {DESTAQUES.map(({ id }) => {
            const doGrupo = fichas.filter((f) => f.destaques[0] === id)
            if (!doGrupo.length) return null
            return (
              <Grupo
                key={id}
                titulo={
                  <h2>
                    <BadgeDestaque id={id} />
                  </h2>
                }
                total={doGrupo.length}
              >
                {doGrupo.map((f) => (
                  <Linha key={f.cadastro.id} ficha={f} direita={<Faixa ficha={f} />} />
                ))}
              </Grupo>
            )
          })}
          <Grupo
            titulo={
              <h2>
                <BadgeDestaque id="em-dia" />
              </h2>
            }
            total={emDia.length}
          >
            <p className="px-4 py-3 text-[14px] text-muted-foreground">
              {emDia.length ? emDia.map((f) => f.cadastro.nome).join(', ') : 'Nenhum paciente em dia.'}
            </p>
          </Grupo>
        </div>

        <Grupo titulo={<h2 className="text-[15px] font-semibold">Próximos questionários</h2>} total={proximos.length}>
          {proximos.length ? (
            proximos.map((f) => <Linha key={f.cadastro.id} ficha={f} direita={quando(f.prevista)} />)
          ) : (
            <p className="px-4 py-3 text-[14px] text-muted-foreground">Nenhum nos próximos {DIAS_A_FRENTE} dias.</p>
          )}
        </Grupo>
      </div>
    </div>
  )
}

function quando(prevista: string): string {
  const dias = diasEntre(HOJE, prevista)
  if (dias === 0) return 'Hoje'
  if (dias === 1) return 'Amanhã'
  return `${dataPorExtenso(prevista).split(',')[0]}, ${dataCurta(prevista)}`
}

function Grupo({ titulo, total, children }: { titulo: ReactNode; total: number; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        {titulo}
        <span className="text-[12px] text-muted-foreground tabular-nums">
          {total} {total === 1 ? 'paciente' : 'pacientes'}
        </span>
      </div>
      <div className="divide-y overflow-hidden rounded-xl bg-card ring-1 ring-border">{children}</div>
    </section>
  )
}

function Linha({ ficha, direita }: { ficha: Ficha; direita: ReactNode }) {
  return (
    <Link
      to={`pacientes/${ficha.cadastro.id}`}
      className="flex min-h-11 items-center gap-3 px-4 py-2 transition-colors hover:bg-background"
    >
      <span className="min-w-0 flex-1 truncate text-[15px]">{ficha.cadastro.nome}</span>
      <span className="text-[13px] text-muted-foreground">{direita}</span>
      <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
    </Link>
  )
}

function Faixa({ ficha }: { ficha: Ficha }) {
  if (!ficha.ultima) return 'Sem respostas'
  const total = pontuacao(ficha.ultima.itens)
  const f = faixa(total)
  return (
    <>
      <span className="font-semibold text-foreground tabular-nums">{total}</span> ·{' '}
      <span className="font-semibold" style={{ color: f.cor }}>
        {f.nome}
      </span>
    </>
  )
}
