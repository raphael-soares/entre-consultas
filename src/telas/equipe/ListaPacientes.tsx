import { Plus, Search, Users } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useMatch, useNavigate } from 'react-router'
import { BadgeFaixa } from '@/componentes/BadgeFaixa'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import { Button } from '@/componentes/ui/button'
import { Input } from '@/componentes/ui/input'
import { EQUIPE, UNIDADE } from '@/dados/fixtures'
import { pontuacao } from '@/dominio/phq9'
import { useListaDoResponsavel, type Ficha } from '@/estado/consultas'
import { useUsuarioLogado } from '@/estado/store'
import { cn } from '@/lib/utils'
import { agrupar, motivosDaLinha, tempoDaLinha } from './secoes'

const semAcento = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

const CONTROLES_COM_SETAS = 'input, textarea, select, [contenteditable], [role=dialog], [role=menu], [role=radiogroup], [role=listbox], [role=slider], [role=tablist]'

export function ListaPacientes() {
  const usuario = useUsuarioLogado()!
  const fichas = useListaDoResponsavel(usuario.id)
  const navigate = useNavigate()
  const aberto = useMatch('/equipe/pacientes/:id/*')?.params.id
  const [busca, setBusca] = useState('')
  const campoBusca = useRef<HTMLInputElement>(null)
  const lista = useRef<HTMLElement>(null)

  const secoes = useMemo(
    () => agrupar(fichas.filter((f) => semAcento(f.cadastro.nome).includes(semAcento(busca.trim())))),
    [fichas, busca],
  )
  const ids = useMemo(() => secoes.flatMap((s) => s.fichas.map((f) => f.cadastro.id)), [secoes])

  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        campoBusca.current?.focus()
        campoBusca.current?.select()
        return
      }
      if ((e.key !== 'ArrowDown' && e.key !== 'ArrowUp') || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
      if (!ids.length || (e.target instanceof Element && e.target.closest(CONTROLES_COM_SETAS))) return
      e.preventDefault()
      const atual = aberto ? ids.indexOf(aberto) : -1
      const passo = e.key === 'ArrowDown' ? 1 : -1
      const proximo = atual === -1 ? (passo === 1 ? 0 : ids.length - 1) : atual + passo
      if (proximo >= 0 && proximo < ids.length) navigate(`/equipe/pacientes/${ids[proximo]}`)
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [ids, aberto, navigate])

  useEffect(() => {
    lista.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest' })
  }, [aberto])

  return (
    <aside className="flex w-[380px] shrink-0 flex-col border-r bg-card">
      <div className="flex flex-col gap-3 px-4 pt-4 pb-2">
        <p className="px-1 text-[13px] font-semibold text-muted-foreground">
          {UNIDADE} · {EQUIPE}
        </p>
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              ref={campoBusca}
              type="search"
              aria-label="Buscar paciente"
              placeholder="Buscar"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="bg-background pl-9 text-[15px]"
            />
          </div>
          <Button asChild variant="outline" size="icon" className="shrink-0">
            <Link to="/equipe/abrir" aria-label="Abrir acompanhamento" title="Abrir acompanhamento">
              <Plus aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
      <nav ref={lista} aria-label="Pacientes" className="min-h-0 flex-1 overflow-y-auto px-2 pb-6">
        {fichas.length === 0 ? (
          <EstadoVazio
            icone={Users}
            titulo="Nenhum paciente com você"
            texto="Abra um acompanhamento a partir do cadastro do e-SUS."
          />
        ) : secoes.length === 0 ? (
          <EstadoVazio icone={Search} titulo="Ninguém com esse nome" texto="Confira a grafia ou limpe a busca." />
        ) : (
          secoes.map((s) => (
            <section key={s.id} aria-labelledby={`secao-${s.id}`}>
              <h2
                id={`secao-${s.id}`}
                className={cn(
                  'sticky top-0 z-10 flex items-baseline justify-between bg-card px-3 pt-4 pb-1 text-[12px] font-semibold tracking-wide uppercase',
                  s.id === 'atencao' ? 'text-risco' : 'text-muted-foreground',
                )}
              >
                {s.titulo}
                <span className="tabular-nums">{s.fichas.length}</span>
              </h2>
              <ul className="flex flex-col">
                {s.fichas.map((f) => (
                  <li key={f.cadastro.id}>
                    <ItemPaciente ficha={f} />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </nav>
    </aside>
  )
}

function ItemPaciente({ ficha }: { ficha: Ficha }) {
  const atual = ficha.ultima ? pontuacao(ficha.ultima.itens) : null
  const motivos = motivosDaLinha(ficha)
  return (
    <NavLink
      to={`/equipe/pacientes/${ficha.cadastro.id}`}
      className={({ isActive }) =>
        cn(
          'flex min-h-14 flex-col justify-center gap-0.5 rounded-lg px-3 py-2 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
          isActive ? 'bg-accent' : 'hover:bg-background',
        )
      }
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-[15px] font-semibold">{ficha.cadastro.nome}</span>
        {atual !== null && (
          <span className="flex shrink-0 items-baseline gap-2 text-[12px]">
            <span className="text-[15px] font-bold tabular-nums text-foreground" aria-label={`Última pontuação ${atual}`}>
              {atual}
            </span>
            <BadgeFaixa pontuacao={atual} curta />
          </span>
        )}
      </div>
      {motivos.length > 0 && (
        <p className="truncate text-[12px] text-muted-foreground">
          {motivos.map((m, i) => (
            <span key={m.texto} className={cn(m.risco && 'font-medium text-risco')}>
              {i > 0 && <span className="text-muted-foreground font-normal"> · </span>}
              {m.texto}
            </span>
          ))}
        </p>
      )}
      <p className="text-[12px] text-muted-foreground">{tempoDaLinha(ficha)}</p>
    </NavLink>
  )
}
