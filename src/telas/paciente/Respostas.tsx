import { ChevronDown, ChevronLeft, ClipboardList } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import { Button } from '@/componentes/ui/button'
import { dataLonga } from '@/dominio/hoje'
import { COMO_RESPONDEU, OPCOES, PERGUNTAS, nomeEstressor } from '@/dominio/phq9'
import type { Resposta } from '@/dominio/tipos'
import { useDados } from '@/estado/consultas'
import { useUsuarioLogado } from '@/estado/store'
import { cn } from '@/lib/utils'

// R.N. 005: só as opções marcadas; nada de pontuação, faixa ou evolução.
export function Respostas() {
  const usuario = useUsuarioLogado()!
  const { respostas } = useDados()
  const minhas = respostas
    .filter((r) => r.pacienteId === usuario.pacienteId)
    .sort((a, b) => b.data.localeCompare(a.data))
  const [aberta, setAberta] = useState<string | undefined>(minhas[0]?.id)

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
        <p className="text-[15px] text-muted-foreground">O que você respondeu em cada questionário.</p>
        {minhas.length === 0 ? (
          <EstadoVazio
            icone={ClipboardList}
            titulo="Nenhuma resposta ainda"
            texto="Quando você responder o primeiro questionário, ele aparece aqui."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {minhas.map((r) => (
              <ItemResposta
                key={r.id}
                resposta={r}
                aberta={aberta === r.id}
                alternar={() => setAberta(aberta === r.id ? undefined : r.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function ItemResposta({ resposta, aberta, alternar }: { resposta: Resposta; aberta: boolean; alternar: () => void }) {
  return (
    <li className="overflow-hidden rounded-xl bg-card ring-1 ring-border">
      <button
        type="button"
        onClick={alternar}
        aria-expanded={aberta}
        className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="flex-1">
          <span className="block text-[17px] font-semibold">{dataLonga(resposta.data)}</span>
          <span className="block text-[15px] text-muted-foreground">{COMO_RESPONDEU[resposta.canal]}</span>
        </span>
        <ChevronDown className={cn('size-5 text-muted-foreground transition-transform', aberta && 'rotate-180')} aria-hidden />
      </button>
      {aberta && (
        <div className="border-t px-4 py-3">
          <ol className="flex flex-col gap-3">
            {PERGUNTAS.map((pergunta, i) => (
              <li key={pergunta} className="text-[15px]">
                <p className="text-muted-foreground">
                  {i + 1}. {pergunta}
                </p>
                <p className="font-semibold">{OPCOES[resposta.itens[i]]}</p>
              </li>
            ))}
          </ol>
          <div className="mt-4 border-t pt-3 text-[15px]">
            <p className="text-muted-foreground">Situações que pesaram</p>
            <p className="font-semibold">
              {resposta.estressores.length
                ? resposta.estressores
                    .map((e) => (e === 'outro' && resposta.outroEstressor ? resposta.outroEstressor : nomeEstressor(e)))
                    .join(', ')
                : 'Nenhuma'}
            </p>
          </div>
        </div>
      )}
    </li>
  )
}
