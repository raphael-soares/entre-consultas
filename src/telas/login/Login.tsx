import { Logo } from '@/componentes/Logo'
import { MarcaGovBr } from '@/componentes/MarcaGovBr'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/componentes/ui/dropdown-menu'
import { VISOES, useAbrirVisao } from '@/lib/visoes'

export function Login() {
  const abrir = useAbrirVisao()

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 px-5 py-10">
      <h1>
        <Logo />
      </h1>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-12 w-full max-w-[320px] items-center justify-center gap-2 rounded-full border border-[#1351B4] bg-white text-[17px] font-semibold text-[#1351B4] transition-colors outline-none hover:bg-[#EEF3FB] focus-visible:ring-3 focus-visible:ring-ring/50">
          Entrar com
          <MarcaGovBr />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
          {VISOES.map((v) => (
            <DropdownMenuItem key={v.chave} onSelect={() => abrir(v)} className="h-11">
              <span className="font-semibold">{v.nome}</span>
              <span className="ml-auto text-[13px] text-muted-foreground">{v.papel}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </main>
  )
}
