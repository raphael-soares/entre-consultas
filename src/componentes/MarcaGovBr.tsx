import { cn } from '@/lib/utils'

export function MarcaGovBr({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-baseline text-[1.35em] leading-none font-extrabold tracking-tight', className)}>
      <span aria-hidden className="inline-flex items-baseline">
        <span className="text-[#1351B4]">g</span>
        <span className="text-[#FFCD07]">o</span>
        <span className="text-[#168821]">v</span>
        <span className="text-[#1351B4]">.br</span>
      </span>
      <span className="sr-only">gov.br</span>
    </span>
  )
}
