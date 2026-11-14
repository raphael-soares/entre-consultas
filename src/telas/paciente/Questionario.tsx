import { Check, ChevronLeft, CircleCheck, HeartHandshake, Phone, X } from 'lucide-react'
import { useEffect } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { Button } from '@/componentes/ui/button'
import { Textarea } from '@/componentes/ui/textarea'
import { CVV, ENUNCIADO, ESTRESSORES, OPCOES, PERGUNTAS } from '@/dominio/phq9'
import type { Estressor } from '@/dominio/tipos'
import { primeiraEmBranco, rascunhoDeExemplo } from '@/estado/rascunho'
import { useStore, useUsuarioLogado, type Rascunho } from '@/estado/store'
import { cn } from '@/lib/utils'

function exemploPara(passo: string): Rascunho {
  if (passo === 'alerta') return rascunhoDeExemplo(9, 1)
  if (passo === 'estressores') return rascunhoDeExemplo(9, 0, ['trabalho'])
  return rascunhoDeExemplo(Number(passo) - 1)
}

export function Questionario() {
  const [params, setParams] = useSearchParams()
  const passo = params.get('passo') ?? '1'
  const rascunho = useStore((s) => s.rascunhos.site)
  const definirRascunho = useStore((s) => s.definirRascunho)

  useEffect(() => {
    if (!rascunho && passo !== 'fim') definirRascunho('site', exemploPara(passo))
  }, [rascunho, passo, definirRascunho])

  const irPara = (proximo: string) => setParams({ passo: proximo })

  if (passo === 'fim') return <Fim />
  if (!rascunho) return null

  const numero = Number(passo)
  if (numero >= 1 && numero <= 9) {
    const emBranco = primeiraEmBranco(rascunho)
    if (emBranco !== -1 && emBranco < numero - 1) return <Navigate to={`?passo=${emBranco + 1}`} replace />
    return <Pergunta numero={numero} rascunho={rascunho} irPara={irPara} />
  }
  const emBranco = primeiraEmBranco(rascunho)
  if (emBranco !== -1) return <Navigate to={`?passo=${emBranco + 1}`} replace />
  if (passo === 'alerta') return <Alerta onContinuar={() => irPara('estressores')} />
  return <Estressores rascunho={rascunho} irPara={irPara} />
}

function BarraTopo({ voltar, progresso }: { voltar?: () => void; progresso?: number }) {
  return (
    <div className="sticky top-0 z-10 bg-background/90 px-3 pt-3 pb-2 backdrop-blur">
      <div className="flex items-center justify-between">
        {voltar ? (
          <Button variant="ghost" onClick={voltar} className="px-2">
            <ChevronLeft className="size-5" aria-hidden />
            Voltar
          </Button>
        ) : (
          <span />
        )}
        {progresso !== undefined && (
          <span className="text-[15px] font-semibold text-muted-foreground">{progresso} de 9</span>
        )}
        <Button variant="ghost" size="icon" asChild>
          <Link to="/paciente" aria-label="Sair do questionário">
            <X className="size-5" aria-hidden />
          </Link>
        </Button>
      </div>
      {progresso !== undefined && (
        <div className="mt-2 flex gap-1 px-2" aria-hidden>
          {PERGUNTAS.map((_, i) => (
            <span key={i} className={cn('h-1 flex-1 rounded-full', i < progresso ? 'bg-primary' : 'bg-[#D1D1D6]')} />
          ))}
        </div>
      )}
    </div>
  )
}

function Pergunta({
  numero,
  rascunho,
  irPara,
}: {
  numero: number
  rascunho: Rascunho
  irPara: (passo: string) => void
}) {
  const definirRascunho = useStore((s) => s.definirRascunho)
  const marcada = rascunho.itens[numero - 1]

  function escolher(valor: number) {
    const itens = rascunho.itens.map((v, i) => (i === numero - 1 ? valor : v))
    definirRascunho('site', { ...rascunho, itens })
    if (numero < 9) irPara(String(numero + 1))
    else irPara(valor > 0 ? 'alerta' : 'estressores')
  }

  return (
    <div className="flex flex-1 flex-col">
      <BarraTopo voltar={numero > 1 ? () => irPara(String(numero - 1)) : undefined} progresso={numero} />
      <div className="flex flex-1 flex-col gap-6 px-5 pt-4 pb-8">
        <div>
          <p className="text-[15px] text-muted-foreground">{ENUNCIADO}</p>
          <h1 id="pergunta" className="mt-3 text-[24px] leading-snug font-bold tracking-tight">
            {PERGUNTAS[numero - 1]}
          </h1>
        </div>
        <div role="radiogroup" aria-labelledby="pergunta" className="flex flex-col gap-3">
          {OPCOES.map((opcao, valor) => {
            const selecionada = marcada === valor
            return (
              <button
                key={opcao}
                type="button"
                role="radio"
                aria-checked={selecionada}
                onClick={() => escolher(valor)}
                className={cn(
                  'flex min-h-14 items-center justify-between gap-3 rounded-xl border-2 bg-card px-4 py-3 text-left text-[17px] font-medium transition-colors',
                  selecionada ? 'border-primary text-primary' : 'border-transparent ring-1 ring-border hover:bg-accent',
                )}
              >
                {opcao}
                {selecionada && <Check className="size-5" aria-hidden />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Alerta({ onContinuar }: { onContinuar: () => void }) {
  return (
    <div className="flex flex-1 flex-col">
      <BarraTopo />
      <div className="flex flex-1 flex-col gap-5 px-5 pt-4 pb-8">
        <div className="rounded-xl bg-card p-5 ring-1 ring-border">
          <span className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
            <HeartHandshake className="size-7" aria-hidden />
          </span>
          <h1 className="mt-4 text-[24px] leading-snug font-bold tracking-tight">Você não está sozinho(a)</h1>
          <p className="mt-3 text-[17px] leading-relaxed">{CVV.texto}</p>
          <Button asChild size="lg" className="mt-5 w-full">
            <a href="tel:188">
              <Phone aria-hidden />
              Ligar para o CVV, 188
            </a>
          </Button>
        </div>
        <p className="text-[15px] text-muted-foreground">
          Sua equipe vai ver esta resposta, mas não acompanha as respostas em tempo real. Em emergência, ligue 192
          (SAMU).
        </p>
        <Button variant="ghost" size="lg" className="mt-auto w-full text-muted-foreground" onClick={onContinuar}>
          Continuar o questionário
        </Button>
      </div>
    </div>
  )
}

function Estressores({ rascunho, irPara }: { rascunho: Rascunho; irPara: (passo: string) => void }) {
  const usuario = useUsuarioLogado()!
  const definirRascunho = useStore((s) => s.definirRascunho)
  const responder = useStore((s) => s.responder)
  const navigate = useNavigate()

  function alternar(id: Estressor, marcado: boolean) {
    const estressores = marcado ? [...rascunho.estressores, id] : rascunho.estressores.filter((e) => e !== id)
    definirRascunho('site', { ...rascunho, estressores })
  }

  function enviar() {
    const outro = rascunho.estressores.includes('outro') ? rascunho.outroEstressor?.trim() : undefined
    responder(usuario.pacienteId!, 'site', {
      itens: rascunho.itens as number[],
      estressores: rascunho.estressores,
      ...(outro ? { outroEstressor: outro } : {}),
    })
    definirRascunho('site', undefined)
    navigate('/paciente/questionario?passo=fim', { replace: true })
  }

  return (
    <div className="flex flex-1 flex-col">
      <BarraTopo voltar={() => irPara(rascunho.itens[8]! > 0 ? 'alerta' : '9')} />
      <div className="flex flex-1 flex-col gap-5 px-5 pt-4 pb-8">
        <div>
          <h1 className="text-[24px] leading-snug font-bold tracking-tight">
            Nas últimas 2 semanas, alguma destas situações pesou para você?
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground">Marque quantas quiser, ou nenhuma.</p>
        </div>
        <div className="flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-border">
          {ESTRESSORES.map((e) => {
            const marcado = rascunho.estressores.includes(e.id)
            return (
              <button
                key={e.id}
                type="button"
                role="checkbox"
                aria-checked={marcado}
                onClick={() => alternar(e.id, !marcado)}
                className="flex min-h-12 w-full items-center justify-between gap-3 border-b py-2 pr-4 pl-4 text-left text-[17px] transition-colors last:border-b-0 hover:bg-accent"
              >
                {e.nome}
                <Check className={cn('size-5 shrink-0 text-primary', !marcado && 'invisible')} strokeWidth={2.5} aria-hidden />
              </button>
            )
          })}
        </div>
        {rascunho.estressores.includes('outro') && (
          <label className="flex flex-col gap-2 text-[15px] font-medium">
            Qual?
            <Textarea
              value={rascunho.outroEstressor ?? ''}
              onChange={(ev) => definirRascunho('site', { ...rascunho, outroEstressor: ev.target.value })}
              className="bg-card text-[17px]"
              maxLength={120}
            />
          </label>
        )}
        <Button size="lg" className="mt-auto w-full" onClick={enviar}>
          Enviar respostas
        </Button>
      </div>
    </div>
  )
}

function Fim() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-10 text-center">
      <CircleCheck className="size-16 text-[#1B7F3B]" aria-hidden />
      <h1 className="text-[24px] leading-snug font-bold tracking-tight">
        Suas respostas foram enviadas para a sua equipe
      </h1>
      <Button asChild size="lg" variant="outline" className="w-full">
        <Link to="/paciente">Voltar ao início</Link>
      </Button>
    </div>
  )
}
