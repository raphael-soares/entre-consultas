import { Link } from 'react-router'
import { Logo } from '@/componentes/Logo'
import { MarcaGovBr } from '@/componentes/MarcaGovBr'

export function Login() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-10 px-5 py-10">
      <Logo />
      <div className="flex w-full max-w-[420px] flex-col items-center gap-6 rounded-2xl bg-card px-6 py-10 text-center ring-1 ring-border min-[501px]:px-10">
        <div>
          <h1 className="text-[28px] leading-tight font-bold tracking-tight">Acompanhe entre as consultas</h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            Entre com a sua conta gov.br. Pacientes, equipe da unidade e psiquiatras entram pelo mesmo caminho.
          </p>
        </div>
        <Link
          to="/login/govbr"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#1351B4] bg-white text-[17px] font-semibold text-[#1351B4] transition-colors hover:bg-[#EEF3FB] focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Entrar com
          <MarcaGovBr />
        </Link>
      </div>
    </main>
  )
}
