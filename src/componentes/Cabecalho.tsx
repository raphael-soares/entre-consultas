import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/componentes/ui/dropdown-menu'
import { useStore, useUsuarioLogado } from '@/estado/store'
import { Logo } from './Logo'

const TITULO = /^(Enf\.|Dra?\.)\s+/

function iniciais(nome: string): string {
  const palavras = nome.replace(TITULO, '').split(/\s+/)
  return (palavras[0][0] + (palavras.length > 1 ? palavras.at(-1)![0] : '')).toUpperCase()
}

export function Cabecalho({ subtitulo }: { subtitulo?: string }) {
  const usuario = useUsuarioLogado()
  const sair = useStore((s) => s.sair)
  const navigate = useNavigate()
  return (
    <header className="flex h-12 items-center justify-between gap-4 border-b bg-card/80 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <Logo compacto />
        {subtitulo && <span className="text-[13px] text-muted-foreground">{subtitulo}</span>}
      </div>
      {usuario && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Conta de ${usuario.nome}`}
            className="-mr-1.5 grid size-11 place-items-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="grid size-8 place-items-center rounded-full bg-accent text-[13px] font-semibold text-accent-foreground">
              {iniciais(usuario.nome)}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
              <span className="text-[15px] font-semibold text-foreground">{usuario.nome}</span>
              <span className="text-[13px] font-normal">{usuario.funcao}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="min-h-11 text-[15px]"
              onSelect={() => {
                sair()
                navigate('/login')
              }}
            >
              <LogOut aria-hidden />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  )
}
