import { ChevronRight, FlaskConical, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/componentes/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/componentes/ui/dropdown-menu'
import { USUARIOS } from '@/dados/fixtures'
import { useStore } from '@/estado/store'
import { useModoPrint } from '@/lib/print'
import { INICIO_DO_PERFIL } from '@/lib/rotas'
import { cn } from '@/lib/utils'

const RECOLHIDO = 'entre-consultas-demo-recolhido'

type Parada = { chave: string; nome: string; papel: string; usuarioId?: string }

const PARADAS: Parada[] = [
  { chave: 'whatsapp', nome: 'Ana', papel: 'WhatsApp' },
  ...['juliana', 'marcos', 'fernanda'].map((id) => {
    const u = USUARIOS.find((x) => x.id === id)!
    return { chave: id, nome: u.nome.split(' ').at(-2)!, papel: u.funcao, usuarioId: id }
  }),
]

export function BotaoDemo() {
  const print = useModoPrint()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const usuarioId = useStore((s) => s.sessao?.usuarioId)
  const reiniciar = useStore((s) => s.reiniciar)
  const entrarComo = useStore((s) => s.entrarComo)
  const definirRascunho = useStore((s) => s.definirRascunho)
  const [recolhido, setRecolhido] = useState(() => localStorage.getItem(RECOLHIDO) === '1')
  const noWhatsApp = pathname.startsWith('/whatsapp')

  const ir = (p: Parada) => {
    if (!p.usuarioId) return navigate('/whatsapp?passo=lembrete')
    const u = USUARIOS.find((x) => x.id === p.usuarioId)!
    entrarComo(u.id)
    navigate(INICIO_DO_PERFIL[u.perfil])
  }

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      const n = Number(e.code.replace('Digit', ''))
      if (!e.altKey || e.ctrlKey || e.metaKey || !(n >= 1 && n <= PARADAS.length)) return
      e.preventDefault()
      ir(PARADAS[n - 1])
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  })

  if (print) return null

  const alternar = () => {
    localStorage.setItem(RECOLHIDO, recolhido ? '0' : '1')
    setRecolhido(!recolhido)
  }

  return (
    <div
      role="toolbar"
      aria-label="Demonstração"
      className="fixed right-3 bottom-24 z-40 flex max-w-[calc(100vw-1.5rem)] items-center gap-0.5 overflow-x-auto rounded-full border bg-card/95 p-1 shadow-lg backdrop-blur min-[501px]:right-4 min-[501px]:bottom-4"
    >
      <Button
        variant="ghost"
        size="icon"
        aria-label={recolhido ? 'Mostrar atalhos da demonstração' : 'Recolher atalhos da demonstração'}
        aria-expanded={!recolhido}
        onClick={alternar}
        className="shrink-0 rounded-full"
      >
        {recolhido ? <FlaskConical aria-hidden /> : <ChevronRight aria-hidden />}
      </Button>
      {!recolhido && (
        <>
          {PARADAS.map((p, i) => {
            const ativo = p.usuarioId ? !noWhatsApp && usuarioId === p.usuarioId : noWhatsApp
            return (
              <button
                key={p.chave}
                type="button"
                aria-pressed={ativo}
                title={`Alt+${i + 1}`}
                onClick={() => ir(p)}
                className={cn(
                  'flex h-11 shrink-0 flex-col items-start justify-center rounded-full px-2.5 text-left leading-tight transition-colors min-[501px]:px-3.5',
                  ativo ? 'bg-foreground text-background' : 'hover:bg-muted',
                )}
              >
                <span className="text-[13px] font-semibold">{p.nome}</span>
                <span className={cn('text-[11px]', ativo ? 'text-background/75' : 'text-muted-foreground')}>{p.papel}</span>
              </button>
            )
          })}
          <span className="mx-0.5 h-6 w-px shrink-0 bg-border" aria-hidden />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Reiniciar" className="shrink-0 rounded-full">
                <RotateCcw aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top">
              {noWhatsApp && (
                <DropdownMenuItem
                  onSelect={() => {
                    definirRascunho('whatsapp', undefined)
                    navigate('/whatsapp?passo=lembrete')
                  }}
                >
                  Reiniciar conversa
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onSelect={() => {
                  reiniciar()
                  toast.success('Demonstração reiniciada com os dados originais.')
                }}
              >
                Reiniciar demonstração
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  )
}
