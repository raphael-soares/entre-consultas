import { Plus, Search, Users } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { BadgeDestaque } from '@/componentes/BadgeDestaque'
import { BadgeFaixa } from '@/componentes/BadgeFaixa'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import { Button } from '@/componentes/ui/button'
import { Input } from '@/componentes/ui/input'
import { dataCurta } from '@/dominio/hoje'
import { pontuacao } from '@/dominio/phq9'
import { useListaDoResponsavel, type Ficha } from '@/estado/consultas'
import { useUsuarioLogado } from '@/estado/store'
import { cn } from '@/lib/utils'

const semAcento = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

export function ListaPacientes() {
  const usuario = useUsuarioLogado()!
  const fichas = useListaDoResponsavel(usuario.id)
  const [busca, setBusca] = useState('')
  const visiveis = fichas.filter((f) => semAcento(f.cadastro.nome).includes(semAcento(busca.trim())))

  return (
    <aside className="flex w-[380px] shrink-0 flex-col border-r bg-card">
      <div className="flex flex-col gap-3 px-5 pt-5 pb-3">
        <div>
          <h1 className="text-[28px] leading-tight font-bold tracking-tight">Meus pacientes</h1>
          <p className="text-[13px] text-muted-foreground">{fichas.length} em acompanhamento</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            aria-label="Buscar paciente"
            placeholder="Buscar por nome"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="bg-background pl-9"
          />
        </div>
        <Button asChild variant="outline">
          <Link to="/equipe/abrir">
            <Plus aria-hidden />
            Abrir acompanhamento
          </Link>
        </Button>
      </div>
      <nav aria-label="Pacientes" className="min-h-0 flex-1 overflow-y-auto px-3 pb-20">
        {fichas.length === 0 ? (
          <EstadoVazio
            icone={Users}
            titulo="Nenhum paciente com você"
            texto="Abra um acompanhamento a partir do cadastro do e-SUS."
          />
        ) : visiveis.length === 0 ? (
          <EstadoVazio icone={Search} titulo="Ninguém com esse nome" texto="Confira a grafia ou limpe a busca." />
        ) : (
          <ul className="flex flex-col gap-1">
            {visiveis.map((f) => (
              <li key={f.cadastro.id}>
                <ItemPaciente ficha={f} />
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  )
}

function ItemPaciente({ ficha }: { ficha: Ficha }) {
  const atual = ficha.ultima ? pontuacao(ficha.ultima.itens) : null
  return (
    <NavLink
      to={`/equipe/pacientes/${ficha.cadastro.id}`}
      className={({ isActive }) =>
        cn('flex flex-col gap-1.5 rounded-lg px-3 py-3 transition-colors', isActive ? 'bg-accent' : 'hover:bg-background')
      }
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-[15px] font-semibold">{ficha.cadastro.nome}</span>
        {atual !== null && (
          <span className="text-[17px] font-bold tabular-nums" aria-label={`Última pontuação ${atual}`}>
            {atual}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {ficha.destaques.length === 0 && <BadgeDestaque id="em-dia" />}
        {ficha.destaques.map((d) => (
          <BadgeDestaque key={d} id={d} />
        ))}
        {ficha.encaminhamento && <BadgeDestaque id="encaminhado" />}
        {atual !== null && <BadgeFaixa pontuacao={atual} className="text-[12px]" />}
      </div>
      <p className="text-[13px] text-muted-foreground">
        {ficha.ultimaResposta ? `Última resposta ${dataCurta(ficha.ultimaResposta)}` : 'Sem respostas ainda'} · Próxima{' '}
        {dataCurta(ficha.prevista)}
      </p>
    </NavLink>
  )
}
