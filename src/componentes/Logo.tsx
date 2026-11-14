import { HeartHandshake } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ className, compacto = false }: { className?: string; compacto?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-bold tracking-tight text-foreground', className)}>
      <HeartHandshake className={cn('text-primary', compacto ? 'size-5' : 'size-7')} aria-hidden />
      <span className={compacto ? 'text-[17px]' : 'text-[22px]'}>Entre Consultas</span>
    </span>
  )
}
