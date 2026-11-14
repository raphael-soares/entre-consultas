import { Outlet } from 'react-router'
import { Cabecalho } from '@/componentes/Cabecalho'

export function LayoutPsiquiatra() {
  return (
    <div className="min-h-svh">
      <Cabecalho subtitulo="Atenção especializada" />
      <main className="mx-auto max-w-[1200px] px-8 pt-7 pb-24">
        <Outlet />
      </main>
    </div>
  )
}
