import { FlaskConical } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/componentes/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/componentes/ui/dropdown-menu'
import { USUARIOS } from '@/dados/fixtures'
import { useStore } from '@/estado/store'
import { useModoPrint } from '@/lib/print'
import { INICIO_DO_PERFIL } from '@/lib/rotas'

const CONTAS_DEMO = USUARIOS.filter((u) => u.senha)

export function BotaoDemo() {
  const print = useModoPrint()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const reiniciar = useStore((s) => s.reiniciar)
  const entrarComo = useStore((s) => s.entrarComo)
  const definirRascunho = useStore((s) => s.definirRascunho)
  if (print) return null

  return (
    <div className="fixed right-3 bottom-24 z-40 min-[501px]:right-auto min-[501px]:bottom-4 min-[501px]:left-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            aria-label="Demonstração"
            className="size-11 rounded-full p-0 shadow-md min-[501px]:h-9 min-[501px]:w-auto min-[501px]:rounded-lg min-[501px]:px-3"
          >
            <FlaskConical aria-hidden />
            <span className="hidden min-[501px]:inline">Demonstração</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-64">
          <DropdownMenuLabel>Entrar como</DropdownMenuLabel>
          {CONTAS_DEMO.map((u) => (
            <DropdownMenuItem
              key={u.id}
              onSelect={() => {
                entrarComo(u.id)
                navigate(INICIO_DO_PERFIL[u.perfil])
              }}
            >
              {u.nome}
              <span className="ml-auto text-xs text-muted-foreground">{u.funcao}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onSelect={() => navigate('/whatsapp?passo=lembrete')}>
            WhatsApp da Ana
            <span className="ml-auto text-xs text-muted-foreground">Paciente</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {pathname === '/whatsapp' && (
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
    </div>
  )
}
