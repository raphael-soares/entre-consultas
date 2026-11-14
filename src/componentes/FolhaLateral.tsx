import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/componentes/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/componentes/ui/sheet'
import { cn } from '@/lib/utils'

export function FolhaLateral({
  titulo,
  descricao,
  aoFechar,
  rodape,
  children,
  className,
}: {
  titulo: string
  descricao: ReactNode
  aoFechar: () => void
  rodape: ReactNode
  children: ReactNode
  // Largura: passe `data-[side=right]:sm:max-w-[NNNpx]`; o padrão do shadcn limita a 24rem.
  className?: string
}) {
  return (
    <Sheet open onOpenChange={(aberto) => !aberto && aoFechar()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          ;(e.currentTarget as HTMLElement | null)?.focus()
        }}
        className={cn('gap-0 bg-background p-0 outline-none data-[side=right]:w-full', className)}
      >
        <SheetHeader className="flex-row items-start justify-between gap-4 border-b bg-card px-6 py-4">
          <div className="min-w-0">
            <SheetTitle className="text-[22px] leading-tight font-bold tracking-tight">{titulo}</SheetTitle>
            <SheetDescription className="mt-0.5 text-[13px]">{descricao}</SheetDescription>
          </div>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" aria-label="Fechar" className="-mt-1 -mr-2 shrink-0">
              <X aria-hidden />
            </Button>
          </SheetClose>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="px-6 py-5">{children}</div>
        </div>
        <SheetFooter className="mt-0 flex-row items-center justify-end gap-3 border-t bg-card px-6 py-3">
          {rodape}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
