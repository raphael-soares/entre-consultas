import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Acima de 500 px a tela do paciente aparece dentro de um celular; abaixo disso é o próprio celular.
export function MolduraCelular({
  children,
  legenda,
  lado,
  className,
}: {
  children: ReactNode
  legenda?: string
  lado?: ReactNode
  className?: string
}) {
  return (
    <div className="min-h-svh min-[501px]:flex min-[501px]:flex-col min-[501px]:items-center min-[501px]:justify-center min-[501px]:gap-3 min-[501px]:py-5">
      {legenda && <p className="hidden text-sm font-medium text-muted-foreground min-[501px]:block">{legenda}</p>}
      <div className="min-[501px]:flex min-[501px]:items-center min-[501px]:gap-10">
        <div
          className={cn(
            'flex min-h-svh flex-col bg-background min-[501px]:h-[min(844px,calc(100svh-4.5rem))] min-[501px]:min-h-0 min-[501px]:w-[390px] min-[501px]:overflow-hidden min-[501px]:rounded-[52px] min-[501px]:border-[10px] min-[501px]:border-[#1c1c1e] min-[501px]:shadow-2xl',
            className,
          )}
        >
          <div className="relative flex min-h-0 flex-1 flex-col min-[501px]:overflow-y-auto">{children}</div>
        </div>
        {lado && <div className="hidden w-64 lg:block">{lado}</div>}
      </div>
    </div>
  )
}
