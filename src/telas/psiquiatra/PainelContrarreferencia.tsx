import { useState } from 'react'
import { toast } from 'sonner'
import { FolhaLateral } from '@/componentes/FolhaLateral'
import { Button } from '@/componentes/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/componentes/ui/field'
import { Textarea } from '@/componentes/ui/textarea'
import { dataPorExtenso } from '@/dominio/hoje'
import type { Contrarreferencia } from '@/dominio/tipos'
import { useStore } from '@/estado/store'

type Campos = Omit<Contrarreferencia, 'data'>

const CAMPOS: { nome: keyof Campos; rotulo: string; dica: string }[] = [
  { nome: 'conduta', rotulo: 'Conduta', dica: 'Diagnóstico, seguimento e o que a unidade deve fazer.' },
  { nome: 'medicacao', rotulo: 'Medicação', dica: 'Fármaco, dose e tempo. Escreva "sem alteração" se for o caso.' },
  { nome: 'reencaminharSe', rotulo: 'Reencaminhar se', dica: 'O que deve trazer o paciente de volta.' },
]

interface Props {
  fechar: () => void
  encaminhamentoId: string
  paciente: string
  atual?: Contrarreferencia
}

export function PainelContrarreferencia({ fechar, encaminhamentoId, paciente, atual }: Props) {
  const responder = useStore((s) => s.responderEncaminhamento)
  const [valores, setValores] = useState<Campos>({
    conduta: atual?.conduta ?? '',
    medicacao: atual?.medicacao ?? '',
    reencaminharSe: atual?.reencaminharSe ?? '',
  })
  const [tentou, setTentou] = useState(false)
  const falta = (nome: keyof Campos) => tentou && !valores[nome].trim()

  function enviar() {
    setTentou(true)
    if (CAMPOS.some((c) => !valores[c.nome].trim())) return
    responder(encaminhamentoId, {
      conduta: valores.conduta.trim(),
      medicacao: valores.medicacao.trim(),
      reencaminharSe: valores.reencaminharSe.trim(),
    })
    toast.success(`${atual ? 'Resposta atualizada' : 'Resposta enviada'} para a unidade de ${paciente.split(' ')[0]}.`)
    fechar()
  }

  return (
    <FolhaLateral
      titulo={atual ? 'Editar resposta' : 'Responder à unidade'}
      descricao={`A equipe de ${paciente} vê esta orientação no acompanhamento. Todos os campos são obrigatórios.`}
      aoFechar={fechar}
      className="data-[side=right]:sm:max-w-[560px]"
      rodape={
        <>
          <Button variant="outline" onClick={fechar}>
            Cancelar
          </Button>
          <Button onClick={enviar}>{atual ? 'Salvar' : 'Enviar à unidade'}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 rounded-xl bg-card px-5 py-4 ring-1 ring-border">
        {CAMPOS.map((c) => (
          <Field key={c.nome} data-invalid={falta(c.nome)}>
            <FieldLabel htmlFor={`contra-${c.nome}`} className="text-[15px]">
              {c.rotulo}
            </FieldLabel>
            <Textarea
              id={`contra-${c.nome}`}
              rows={3}
              value={valores[c.nome]}
              onChange={(e) => setValores((v) => ({ ...v, [c.nome]: e.target.value }))}
              aria-invalid={falta(c.nome)}
            />
            {falta(c.nome) ? <FieldError>Preencha este campo.</FieldError> : <FieldDescription>{c.dica}</FieldDescription>}
          </Field>
        ))}
      </div>
    </FolhaLateral>
  )
}

export function CartaoContrarreferencia({ contrarreferencia }: { contrarreferencia: Contrarreferencia }) {
  return (
    <section aria-label="Sua orientação para a unidade" className="rounded-xl bg-card px-5 py-4 ring-1 ring-border">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="text-[15px] font-semibold">Sua orientação para a unidade</h2>
        <p className="text-[12px] text-muted-foreground">Enviada em {dataPorExtenso(contrarreferencia.data).toLowerCase()}</p>
      </div>
      <dl className="grid grid-cols-3 gap-6 text-[14px] leading-snug">
        {CAMPOS.map((c) => (
          <div key={c.nome} className="flex flex-col gap-0.5">
            <dt className="text-[12px] font-medium text-muted-foreground">{c.rotulo}</dt>
            <dd>{contrarreferencia[c.nome]}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
