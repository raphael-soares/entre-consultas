import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/componentes/ui/button'
import { useStore, useUsuarioLogado } from '@/estado/store'
import { Logo } from './Logo'

export function Cabecalho({ subtitulo }: { subtitulo?: string }) {
  const usuario = useUsuarioLogado()
  const sair = useStore((s) => s.sair)
  const navigate = useNavigate()
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b bg-card/80 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <Logo compacto />
        {subtitulo && <span className="text-sm text-muted-foreground">{subtitulo}</span>}
      </div>
      {usuario && (
        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <p className="text-sm font-semibold">{usuario.nome}</p>
            <p className="text-[13px] text-muted-foreground">{usuario.funcao}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              sair()
              navigate('/login')
            }}
          >
            <LogOut aria-hidden />
            Sair
          </Button>
        </div>
      )}
    </header>
  )
}
