import { ChevronLeft, Phone } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { EscolhaUnica } from '@/componentes/EscolhaUnica'
import { Button } from '@/componentes/ui/button'
import { Checkbox } from '@/componentes/ui/checkbox'
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from '@/componentes/ui/field'
import { Input } from '@/componentes/ui/input'
import { HOJE, dataLonga } from '@/dominio/hoje'
import { ENUNCIADO, ESTRESSORES, OPCOES, PERGUNTAS } from '@/dominio/phq9'
import type { Estressor } from '@/dominio/tipos'
import { useFicha } from '@/estado/consultas'
import { useStore, useUsuarioLogado } from '@/estado/store'
import { cn } from '@/lib/utils'

type Local = 'unidade' | 'visita'

const OPCOES_RESPOSTA = OPCOES.map((rotulo, i) => ({ valor: String(i), rotulo }))
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
  const [estressores, setEstressores] = useState<Estressor[]>([])
  const [outro, setOutro] = useState('')
  const [tentou, setTentou] = useState(false)

  if (!ficha) return null
  const faltando = itens.map((v, i) => (v === null ? i + 1 : 0)).filter(Boolean)

  function salvar() {
    setTentou(true)
    if (!local || faltando.length) return
    registrar(ficha!.cadastro.id, local, {
      itens: itens as number[],
      estressores,
      ...(estressores.includes('outro') && outro.trim() ? { outroEstressor: outro.trim() } : {}),
    })
    toast.success('Respostas registradas.')
    navigate(`/equipe/pacientes/${ficha!.cadastro.id}`)
  }

  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-6 px-8 pt-6 pb-24">
      <Button asChild variant="ghost" className="self-start px-2">
        <Link to={`/equipe/pacientes/${ficha.cadastro.id}`}>
          <ChevronLeft aria-hidden />
          {ficha.cadastro.nome}
        </Link>
      </Button>
      <div>
        <h1 className="text-[34px] leading-tight font-bold tracking-tight">Registrar respostas</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">
          {ficha.cadastro.nome} · {dataLonga(HOJE)} · registrado por {usuario.nome}
        </p>
      </div>

      <FieldSet className="rounded-xl bg-card p-5 ring-1 ring-border">
        <FieldLegend className="text-[17px] font-semibold">Onde foi respondido</FieldLegend>
        <EscolhaUnica
          rotulo="Onde foi respondido"
          opcoes={LOCAIS}
          valor={local}
          aoMudar={setLocal}
          invalido={tentou && !local}
          className="grid-cols-2"
        />
        {tentou && !local && <FieldError>Escolha onde foi respondido.</FieldError>}
      </FieldSet>

      <section className="flex flex-col gap-5 rounded-xl bg-card p-5 ring-1 ring-border">
        <div>
          <h2 className="text-[17px] font-semibold">PHQ-9</h2>
          <p className="text-[15px] text-muted-foreground">{ENUNCIADO}</p>
        </div>
        {PERGUNTAS.map((pergunta, i) => {
          const invalido = tentou && itens[i] === null
          return (
            <Field key={pergunta} data-invalid={invalido} className={cn(i > 0 && 'border-t pt-5')}>
              <FieldLabel className="text-[15px] font-semibold">
                {i + 1}. {pergunta}
              </FieldLabel>
              <EscolhaUnica
                rotulo={`${i + 1}. ${pergunta}`}
                opcoes={OPCOES_RESPOSTA}
                valor={itens[i] === null ? undefined : String(itens[i])}
                aoMudar={(v) => setItens(itens.map((atual, j) => (j === i ? Number(v) : atual)))}
                invalido={invalido}
                className="grid-cols-4"
              />
              {i === 8 && (itens[8] ?? 0) > 0 && (
                <div role="alert" className="flex items-start gap-3 rounded-lg bg-risco px-4 py-3 text-[15px] text-white">
                  <Phone className="mt-0.5 size-5 shrink-0" aria-hidden />
                  <p>
                    <strong>Pergunta 9 positiva.</strong> Antes de encerrar o atendimento, fale com o paciente sobre o
                    risco e passe o CVV (188, gratuito, 24 horas).
                  </p>
                </div>
              )}
            </Field>
          )
        })}
      </section>

      <FieldSet className="rounded-xl bg-card p-5 ring-1 ring-border">
        <FieldLegend className="text-[17px] font-semibold">Situações que pesaram nas últimas 2 semanas</FieldLegend>
        <div className="grid grid-cols-2 gap-2">
          {ESTRESSORES.map((e) => (
            <label
              key={e.id}
              className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-3 text-[15px] has-data-checked:border-primary has-data-checked:bg-accent"
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
            <FieldLabel htmlFor="outro-estressor" className="text-[15px]">
              Qual outra situação?
            </FieldLabel>
            <Input id="outro-estressor" value={outro} onChange={(e) => setOutro(e.target.value)} />
          </Field>
        )}
      </FieldSet>

      <div className="flex items-center justify-end gap-3">
        {tentou && faltando.length > 0 && (
          <p className="mr-auto text-[15px] font-medium text-destructive">
            Falta responder {faltando.length === 1 ? 'a pergunta' : 'as perguntas'} {faltando.join(', ')}.
          </p>
        )}
        <Button asChild variant="outline">
          <Link to={`/equipe/pacientes/${ficha.cadastro.id}`}>Cancelar</Link>
        </Button>
        <Button onClick={salvar}>Salvar respostas</Button>
      </div>
    </div>
  )
}
