import { BatteryFull, Signal, Wifi } from 'lucide-react'
import type { ReactNode } from 'react'
import { useModoPrint } from '@/lib/print'
import { cn } from '@/lib/utils'

const ESTILOS = {
  padrao: { status: 'bg-background text-foreground', base: 'bg-background', indicador: 'bg-foreground' },
  whatsapp: { status: 'bg-whatsapp-topo text-white', base: 'bg-[#f0f2f5]', indicador: 'bg-foreground' },
}

// Acima de 500 px a tela do paciente aparece dentro de um celular; abaixo disso é o próprio celular.
// A barra de status e o indicador de início são só cenário: aparecem na moldura e nos prints (?print=1).
export function MolduraCelular({
  children,
  legenda,
  lado,
  estilo = 'padrao',
}: {
  children: ReactNode
  legenda?: string
  lado?: ReactNode
  estilo?: keyof typeof ESTILOS
}) {
  const print = useModoPrint()
  const cenario = print ? 'flex' : 'hidden min-[501px]:flex'
  const cores = ESTILOS[estilo]

  return (
    <div className="h-svh min-[501px]:flex min-[501px]:h-auto min-[501px]:min-h-svh min-[501px]:flex-col min-[501px]:items-center min-[501px]:justify-center min-[501px]:gap-3 min-[501px]:bg-palco min-[501px]:py-5">
      {legenda && <p className="hidden text-sm font-medium text-palco-foreground min-[501px]:block">{legenda}</p>}
      <div className="h-full min-[501px]:flex min-[501px]:h-auto min-[501px]:items-center min-[501px]:gap-10">
        <div className="relative h-full min-[501px]:h-auto">
          <span aria-hidden className="absolute top-[150px] -left-[3px] hidden h-8 w-[4px] rounded-l-sm bg-[#3a3a3c] min-[501px]:block" />
          <span aria-hidden className="absolute top-[200px] -left-[3px] hidden h-14 w-[4px] rounded-l-sm bg-[#3a3a3c] min-[501px]:block" />
          <span aria-hidden className="absolute top-[270px] -left-[3px] hidden h-14 w-[4px] rounded-l-sm bg-[#3a3a3c] min-[501px]:block" />
          <span aria-hidden className="absolute top-[220px] -right-[3px] hidden h-20 w-[4px] rounded-r-sm bg-[#3a3a3c] min-[501px]:block" />
          <div className="flex h-full flex-col overflow-hidden bg-background min-[501px]:h-[min(844px,calc(100svh-4.5rem))] min-[501px]:w-[390px] min-[501px]:rounded-[52px] min-[501px]:border-[10px] min-[501px]:border-[#1c1c1e] min-[501px]:shadow-2xl min-[501px]:ring-1 min-[501px]:ring-[#5a5a5e]">
            <div
              aria-hidden
              className={cn('relative h-[47px] shrink-0 items-center justify-between px-8 pt-1', cenario, cores.status)}
            >
              <span className="text-[16px] font-semibold tracking-tight">14:20</span>
              <span className="absolute top-[10px] left-1/2 hidden h-[30px] w-[112px] -translate-x-1/2 rounded-full bg-black min-[501px]:block" />
              <span className="flex items-center gap-1.5">
                <Signal className="size-4" strokeWidth={2.5} />
                <Wifi className="size-4" strokeWidth={2.5} />
                <BatteryFull className="size-6" strokeWidth={1.75} />
              </span>
            </div>
            <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
            <div aria-hidden className={cn('h-[26px] shrink-0 items-center justify-center', cenario, cores.base)}>
              <span className={cn('h-[5px] w-[134px] rounded-full', cores.indicador)} />
            </div>
          </div>
        </div>
        {lado && <div className="hidden w-64 lg:block">{lado}</div>}
      </div>
    </div>
  )
}
