import { Phone } from 'lucide-react'
import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { FolhaLateral } from '@/componentes/FolhaLateral'
import { Segmentado } from '@/componentes/Segmentado'
import { Button } from '@/componentes/ui/button'
import { Checkbox } from '@/componentes/ui/checkbox'
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from '@/componentes/ui/field'
import { Input } from '@/componentes/ui/input'
import { RadioGroup, RadioGroupItem } from '@/componentes/ui/radio-group'
import { HOJE, dataPorExtenso } from '@/dominio/hoje'
import { ENUNCIADO, ESTRESSORES, OPCOES, PERGUNTAS } from '@/dominio/phq9'
import type { Estressor } from '@/dominio/tipos'
import { useFicha } from '@/estado/consultas'
import { useStore, useUsuarioLogado } from '@/estado/store'
import { cn } from '@/lib/utils'

type Local = 'unidade' | 'visita'

const GRADE = 'grid grid-cols-[minmax(0,1fr)_repeat(4,76px)] items-center gap-x-1'
const LOCAIS: { valor: Local; rotulo: string }[] = [
  { valor: 'unidade', rotulo: 'Na unidade' },
  { valor: 'visita', rotulo: 'Visita domiciliar' },
]

export function Registrar() {
  const { id } = useParams()
  const ficha = useFicha(id)
  const usuario = useUsuarioLogado()!
  const registrar = useStore((s) => s.registrarPeloProfissional)
  const navigate = useNavigate()
  const [local, setLocal] = useState<Local>()
  const [itens, setItens] = useState<(number | null)[]>(Array(9).fill(null))
  const [linhaAtual, setLinhaAtual] = useState<number | null>(null)
  const [estressores, setEstressores] = useState<Estressor[]>([])
  const [outro, setOutro] = useState('')
  const [tentou, setTentou] = useState(false)

  if (!ficha) return null
  const voltar = `/equipe/pacientes/${ficha.cadastro.id}`
  const faltando = itens.map((v, i) => (v === null ? i + 1 : 0)).filter(Boolean)

  function salvar(e?: FormEvent) {
    e?.preventDefault()
    setTentou(true)
    if (!local || faltando.length) return
    registrar(ficha!.cadastro.id, local, {
      itens: itens as number[],
      estressores,
      ...(estressores.includes('outro') && outro.trim() ? { outroEstressor: outro.trim() } : {}),
    })
    toast.success('Respostas registradas.')
    navigate(voltar)
  }

  function responderComTeclado(e: KeyboardEvent<HTMLElement>) {
    if (linhaAtual === null || e.ctrlKey || e.metaKey || e.altKey || !/^[0-3]$/.test(e.key)) return
    if ((e.target as HTMLElement).tagName === 'INPUT') return
    e.preventDefault()
    setItens((atual) => atual.map((v, j) => (j === linhaAtual ? Number(e.key) : v)))
    if (linhaAtual === 8) return
    const proxima = e.currentTarget.querySelectorAll<HTMLElement>(`[data-linha="${linhaAtual + 1}"] [role=radio]`)
    ;(Array.from(proxima).find((r) => r.dataset.state === 'checked') ?? proxima[0])?.focus()
  }

  return (
    <FolhaLateral
      titulo="Registrar respostas"
      descricao={`${ficha.cadastro.nome} · ${dataPorExtenso(HOJE)} · registrado por ${usuario.nome}`}
      aoFechar={() => navigate(voltar)}
      className="data-[side=right]:sm:max-w-[780px]"
      rodape={
        <>
          {tentou && faltando.length > 0 && (
            <p className="mr-auto text-[14px] font-medium text-destructive">
              Falta responder {faltando.length === 1 ? 'a pergunta' : 'as perguntas'} {faltando.join(', ')}.
            </p>
          )}
          <Button asChild variant="outline">
            <Link to={voltar}>Cancelar</Link>
          </Button>
          <Button type="submit" form="registrar-respostas">
            Salvar respostas
          </Button>
        </>
      }
    >
      <form id="registrar-respostas" onSubmit={salvar} noValidate className="flex flex-col gap-4">
        <section className="rounded-xl bg-card px-5 py-4 ring-1 ring-border">
          <FieldSet className="gap-3">
            <FieldLegend className="mb-0 text-[15px] font-semibold">Onde foi respondido</FieldLegend>
            <Segmentado
              rotulo="Onde foi respondido"
              opcoes={LOCAIS}
              valor={local}
              aoMudar={setLocal}
              invalido={tentou && !local}
              className="w-full"
            />
            {tentou && !local && <FieldError>Escolha onde foi respondido.</FieldError>}
          </FieldSet>
        </section>

        <section
          className="rounded-xl bg-card px-5 py-4 ring-1 ring-border"
          onKeyDown={responderComTeclado}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setLinhaAtual(null)
          }}
        >
          <h2 className="text-[15px] font-semibold">PHQ-9</h2>
          <p className="text-[14px] text-muted-foreground">{ENUNCIADO}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Digite 0 a 3 para responder e passar para a próxima pergunta.
          </p>
          <div className={cn(GRADE, 'sticky top-0 z-10 -mx-2 mt-3 border-b bg-card px-2 py-2')} aria-hidden>
            <span />
            {OPCOES.map((o, valor) => (
              <span key={o} className="text-center text-[12px] leading-tight font-medium text-muted-foreground">
                <span className="block font-semibold text-foreground tabular-nums">{valor}</span>
                {o}
              </span>
            ))}
          </div>
          <div className="divide-y">
            {PERGUNTAS.map((pergunta, i) => {
              const invalido = tentou && itens[i] === null
              const idPergunta = `pergunta-${i + 1}`
              return (
                <div
                  key={pergunta}
                  data-linha={i}
                  onFocus={() => setLinhaAtual(i)}
                  className={cn(
                    '-mx-2 px-2 py-1.5 transition-colors',
                    linhaAtual === i && 'rounded-md bg-accent',
                    invalido && linhaAtual !== i && 'rounded-md bg-destructive/5',
                  )}
                >
                  <RadioGroup
                    aria-labelledby={idPergunta}
                    aria-invalid={invalido}
                    value={itens[i] === null ? '' : String(itens[i])}
                    onValueChange={(v) => setItens(itens.map((atual, j) => (j === i ? Number(v) : atual)))}
                    className={GRADE}
                  >
                    <p id={idPergunta} className={cn('py-1.5 text-[14px] leading-snug', invalido && 'text-destructive')}>
                      <span className="text-muted-foreground tabular-nums">{i + 1}. </span>
                      {pergunta}
                    </p>
                    {OPCOES.map((o, valor) => (
                      <label key={o} className="flex h-11 cursor-pointer items-center justify-center rounded-md hover:bg-muted">
                        <RadioGroupItem value={String(valor)} aria-label={o} className="size-5" />
                      </label>
                    ))}
                  </RadioGroup>
                  {i === 8 && (itens[8] ?? 0) > 0 && (
                    <div
                      role="alert"
                      className="mt-1 mb-1 flex items-start gap-3 rounded-lg border border-risco/30 bg-risco/10 px-4 py-3 text-[14px]"
                    >
                      <Phone className="mt-0.5 size-5 shrink-0 text-risco" aria-hidden />
                      <p>
                        <strong className="text-risco">Pensou em se ferir.</strong> Antes de encerrar o atendimento, fale
                        com o paciente sobre o risco e passe o CVV (188, gratuito, 24 horas).
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-xl bg-card px-5 py-4 ring-1 ring-border">
          <FieldSet className="gap-3">
            <FieldLegend className="mb-0 text-[15px] font-semibold">Situações que pesaram nas últimas 2 semanas</FieldLegend>
            <div className="grid grid-cols-2 gap-2">
              {ESTRESSORES.map((e) => (
                <label
                  key={e.id}
                  className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-3 text-[14px] has-data-checked:border-primary has-data-checked:bg-accent"
                >
                  <Checkbox
                    checked={estressores.includes(e.id)}
                    onCheckedChange={(v) =>
                      setEstressores(v === true ? [...estressores, e.id] : estressores.filter((x) => x !== e.id))
                    }
                  />
                  {e.nome}
                </label>
              ))}
            </div>
            {estressores.includes('outro') && (
              <Field>
                <FieldLabel htmlFor="outro-estressor" className="text-[14px]">
                  Qual outra situação?
                </FieldLabel>
                <Input id="outro-estressor" value={outro} onChange={(e) => setOutro(e.target.value)} />
              </Field>
            )}
          </FieldSet>
        </section>
      </form>
    </FolhaLateral>
  )
}
