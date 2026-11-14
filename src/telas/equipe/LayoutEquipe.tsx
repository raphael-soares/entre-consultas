import { Outlet, useLocation } from 'react-router'
import { Cabecalho } from '@/componentes/Cabecalho'
import { EQUIPE, UNIDADE } from '@/dados/fixtures'
import { ListaPacientes } from './ListaPacientes'

export function LayoutEquipe() {
  const { pathname } = useLocation()
  return (
    <div className="flex h-svh flex-col">
      <Cabecalho subtitulo={`${UNIDADE} · ${EQUIPE}`} />
      <div className="flex min-h-0 flex-1">
        <ListaPacientes />
        <main key={pathname} className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
