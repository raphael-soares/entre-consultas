import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react'
import { Link } from 'react-router'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import { Button } from '@/componentes/ui/button'
import { dataPorExtenso } from '@/dominio/hoje'
import { COMO_RESPONDEU } from '@/dominio/phq9'
import { useDados } from '@/estado/consultas'
import { useUsuarioLogado } from '@/estado/store'

// R.N. 005: só datas e canais; nada de pontuação, faixa ou evolução.
export function Respostas() {
  const usuario = useUsuarioLogado()!
  const { respostas } = useDados()
  const minhas = respostas
    .filter((r) => r.pacienteId === usuario.pacienteId)
    .sort((a, b) => b.data.localeCompare(a.data))

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-10 bg-background/90 px-3 pt-3 pb-2 backdrop-blur">
        <Button variant="ghost" asChild className="px-2">
          <Link to="/paciente">
            <ChevronLeft className="size-5" aria-hidden />
            Início
          </Link>
        </Button>
      </div>
      <div className="flex flex-col gap-4 px-5 pt-2 pb-10">
        <h1 className="text-[34px] leading-tight font-bold tracking-tight">Respostas anteriores</h1>
        <p className="text-[15px] text-muted-foreground">Toque em uma data para ver o que você respondeu.</p>
        {minhas.length === 0 ? (
          <EstadoVazio
            icone={ClipboardList}
            titulo="Nenhuma resposta ainda"
            texto="Quando você responder o primeiro questionário, ele aparece aqui."
          />
        ) : (
          <ul className="overflow-hidden rounded-xl bg-card ring-1 ring-border">
            {minhas.map((r) => (
              <li key={r.id} className="border-b last:border-b-0">
                <Link
                  to={`/paciente/respostas/${r.id}`}
                  className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-accent"
                >
                  <span className="flex-1">
                    <span className="block text-[17px] font-semibold">{dataPorExtenso(r.data)}</span>
                    <span className="block text-[15px] text-muted-foreground">{COMO_RESPONDEU[r.canal]}</span>
                  </span>
                  <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
