import { Outlet, useLocation } from 'react-router'
import { Cabecalho } from '@/componentes/Cabecalho'
import { ListaPacientes } from './ListaPacientes'

export function LayoutEquipe() {
  const { pathname } = useLocation()
  return (
    <div className="flex h-svh flex-col">
      <Cabecalho />
      <div className="flex min-h-0 flex-1">
        <ListaPacientes />
        <main key={pathname.replace(/\/(registrar|encaminhar|abrir)$/, '')} className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
