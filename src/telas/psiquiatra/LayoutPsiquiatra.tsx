import { Outlet } from 'react-router'
import { Cabecalho } from '@/componentes/Cabecalho'

export function LayoutPsiquiatra() {
  return (
    <div className="min-h-svh">
      <div className="sticky top-0 z-40">
        <Cabecalho subtitulo="Atenção especializada" />
      </div>
      <div className="has-[[data-inspetor]]:pr-[400px]">
        <main className="mx-auto max-w-[1200px] px-8 pt-5 pb-16">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
