import { Outlet } from 'react-router'
import { Toaster } from '@/componentes/ui/sonner'
import { TooltipProvider } from '@/componentes/ui/tooltip'
import { BotaoDemo } from './BotaoDemo'

export function Raiz() {
  return (
    <TooltipProvider>
      <Outlet />
      <BotaoDemo />
      <Toaster position="top-center" />
    </TooltipProvider>
  )
}
