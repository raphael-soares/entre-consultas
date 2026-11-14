import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { HOJE, dataPorExtenso, dataRelativa, diasEntre } from '@/dominio/hoje'
import { useListaDoResponsavel } from '@/estado/consultas'
import { useUsuarioLogado } from '@/estado/store'
import { precisaDeAtencao } from './secoes'

const DIAS_A_FRENTE = 7

function frase(atencao: number, total: number): string {
  if (total === 0) return 'Nenhum paciente em acompanhamento com você.'
  if (atencao === 0) return 'Nenhum paciente precisa de atenção agora.'
  return atencao === 1 ? '1 paciente precisa de atenção.' : `${atencao} pacientes precisam de atenção.`
}

export function InicioEquipe() {
  const usuario = useUsuarioLogado()!
  const fichas = useListaDoResponsavel(usuario.id)
  const atencao = fichas.filter(precisaDeAtencao).length
  const proximos = fichas
    .filter((f) => {
      const dias = diasEntre(HOJE, f.prevista)
      return dias >= 0 && dias <= DIAS_A_FRENTE
    })
    .sort((a, b) => a.prevista.localeCompare(b.prevista))

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-8 pt-10 pb-16">
      <header>
        <h1 className="text-[28px] leading-tight font-bold tracking-tight">{dataPorExtenso(HOJE)}</h1>
        <p className="text-[15px] text-muted-foreground">{frase(atencao, fichas.length)}</p>
      </header>

      <section aria-labelledby="proximos" className="flex flex-col gap-2">
        <h2 id="proximos" className="px-1 text-[15px] font-semibold">
          Próximos questionários
        </h2>
        <div className="divide-y overflow-hidden rounded-xl bg-card ring-1 ring-border">
          {proximos.length ? (
            proximos.map((f) => (
              <Link
                key={f.cadastro.id}
                to={`/equipe/pacientes/${f.cadastro.id}`}
                className="flex min-h-11 items-center gap-3 px-5 py-2 transition-colors hover:bg-background"
              >
                <span className="min-w-0 flex-1 truncate text-[15px]">{f.cadastro.nome}</span>
                <span className="text-[13px] text-muted-foreground">{dataRelativa(f.prevista)}</span>
                <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
              </Link>
            ))
          ) : (
            <p className="px-5 py-4 text-[14px] text-muted-foreground">
              Nenhum questionário previsto nos próximos {DIAS_A_FRENTE} dias.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
