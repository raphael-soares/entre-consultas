import { useState } from 'react'
import { toast } from 'sonner'
import { FolhaLateral } from '@/componentes/FolhaLateral'
import { Button } from '@/componentes/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/componentes/ui/field'
import { Input } from '@/componentes/ui/input'
import { HOJE, dataPorExtenso } from '@/dominio/hoje'
import { useStore } from '@/estado/store'

interface Props {
  fechar: () => void
  encaminhamentoId: string
  paciente: string
  dataAtual?: string
}

export function PainelConsulta({ fechar, encaminhamentoId, paciente, dataAtual }: Props) {
  const marcarConsulta = useStore((s) => s.marcarConsulta)
  const [data, setData] = useState(dataAtual ?? '')
  const [tentou, setTentou] = useState(false)
  const invalida = data < HOJE

  function salvar() {
    setTentou(true)
    if (invalida) return
    marcarConsulta(encaminhamentoId, data)
    toast.success(`Consulta de ${paciente.split(' ')[0]} marcada para ${dataPorExtenso(data).toLowerCase()}.`)
    fechar()
  }

  return (
    <FolhaLateral
      titulo={dataAtual ? 'Remarcar consulta' : 'Marcar consulta'}
      descricao={paciente}
      aoFechar={fechar}
      className="data-[side=right]:sm:max-w-[440px]"
      rodape={
        <>
          <Button variant="outline" onClick={fechar}>
            Cancelar
          </Button>
          <Button onClick={salvar}>Salvar</Button>
        </>
      }
    >
      <div className="rounded-xl bg-card px-5 py-4 ring-1 ring-border">
        <Field data-invalid={tentou && invalida}>
          <FieldLabel htmlFor="data-consulta" className="text-[15px]">
            Data da consulta
          </FieldLabel>
          <Input
            id="data-consulta"
            type="date"
            min={HOJE}
            value={data}
            onChange={(e) => setData(e.target.value)}
            aria-invalid={tentou && invalida}
          />
          {tentou && invalida ? (
            <FieldError>Escolha uma data a partir de hoje.</FieldError>
          ) : (
            <FieldDescription>A unidade vê a data marcada no acompanhamento.</FieldDescription>
          )}
        </Field>
      </div>
    </FolhaLateral>
  )
}
