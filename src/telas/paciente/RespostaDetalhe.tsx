import { ChevronLeft } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router'
import { Button } from '@/componentes/ui/button'
import { dataPorExtenso } from '@/dominio/hoje'
import { COMO_RESPONDEU, OPCOES, PERGUNTAS, nomeEstressor } from '@/dominio/phq9'
import { useDados } from '@/estado/consultas'
import { useUsuarioLogado } from '@/estado/store'

// R.N. 005: as opções marcadas e os estressores; nada de pontuação ou faixa.
export function RespostaDetalhe() {
  const { id } = useParams()
  const usuario = useUsuarioLogado()!
  const { respostas } = useDados()
  const resposta = respostas.find((r) => r.id === id && r.pacienteId === usuario.pacienteId)
  if (!resposta) return <Navigate to="/paciente/respostas" replace />

  const estressores = resposta.estressores.map((e) =>
    e === 'outro' && resposta.outroEstressor ? resposta.outroEstressor : nomeEstressor(e),
  )

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-10 bg-background/90 px-3 pt-3 pb-2 backdrop-blur">
        <Button variant="ghost" asChild className="px-2">
          <Link to="/paciente/respostas">
            <ChevronLeft className="size-5" aria-hidden />
            Respostas
          </Link>
        </Button>
      </div>
      <div className="flex flex-col gap-5 px-5 pt-2 pb-10">
        <div>
          <h1 className="text-[28px] leading-tight font-bold tracking-tight">{dataPorExtenso(resposta.data)}</h1>
          <p className="mt-1 text-[15px] text-muted-foreground">{COMO_RESPONDEU[resposta.canal]}</p>
        </div>
        <ol className="overflow-hidden rounded-xl bg-card ring-1 ring-border">
          {PERGUNTAS.map((pergunta, i) => (
            <li key={pergunta} className="border-b px-4 py-3 last:border-b-0">
              <p className="text-[13px] text-muted-foreground">{pergunta}</p>
              <p className="mt-0.5 text-[17px] font-semibold">{OPCOES[resposta.itens[i]]}</p>
            </li>
          ))}
        </ol>
        <section>
          <h2 className="px-4 pb-1.5 text-[13px] font-medium text-muted-foreground uppercase">Situações que pesaram</h2>
          <div className="rounded-xl bg-card px-4 py-3 ring-1 ring-border">
            <p className="text-[17px]">{estressores.length ? estressores.join(', ') : 'Nenhuma'}</p>
          </div>
        </section>
      </div>
    </div>
  )
}
