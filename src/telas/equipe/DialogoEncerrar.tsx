import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { EscolhaUnica } from '@/componentes/EscolhaUnica'
import { Button } from '@/componentes/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/componentes/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/componentes/ui/field'
import { Textarea } from '@/componentes/ui/textarea'
import { MOTIVOS_ENCERRAMENTO } from '@/dominio/rotulos'
import type { MotivoEncerramento } from '@/dominio/tipos'
import type { Ficha } from '@/estado/consultas'
import { useStore } from '@/estado/store'

const OPCOES = Object.entries(MOTIVOS_ENCERRAMENTO).map(([valor, rotulo]) => ({
  valor: valor as MotivoEncerramento,
  rotulo,
}))

export function DialogoEncerrar({ aberto, fechar, ficha }: { aberto: boolean; fechar: () => void; ficha: Ficha }) {
  const encerrar = useStore((s) => s.encerrarAcompanhamento)
  const navigate = useNavigate()
  const [motivo, setMotivo] = useState<MotivoEncerramento>()
  const [detalhe, setDetalhe] = useState('')
  const [tentou, setTentou] = useState(false)
  const faltaMotivo = !motivo
  const faltaDetalhe = motivo === 'outro' && !detalhe.trim()

  function confirmar() {
    setTentou(true)
    if (!motivo || faltaDetalhe) return
    encerrar(ficha.cadastro.id, motivo, detalhe.trim() || undefined)
    toast.success(`Acompanhamento de ${ficha.cadastro.nome} encerrado.`)
    navigate('/equipe')
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && fechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Encerrar o acompanhamento de {ficha.cadastro.nome}?</DialogTitle>
          <DialogDescription>
            O paciente sai da sua lista e para de receber lembretes. As respostas continuam guardadas.
          </DialogDescription>
        </DialogHeader>
        <Field data-invalid={tentou && faltaMotivo}>
          <FieldLabel className="text-[15px]">Motivo</FieldLabel>
          <EscolhaUnica
            rotulo="Motivo do encerramento"
            opcoes={OPCOES}
            valor={motivo}
            aoMudar={setMotivo}
            invalido={tentou && faltaMotivo}
            className="grid-cols-2"
          />
          {tentou && faltaMotivo && <FieldError>Escolha o motivo.</FieldError>}
        </Field>
        <Field data-invalid={tentou && faltaDetalhe}>
          <FieldLabel htmlFor="detalhe-encerrar" className="text-[15px]">
            Observação {motivo === 'outro' ? '' : '(opcional)'}
          </FieldLabel>
          <Textarea
            id="detalhe-encerrar"
            value={detalhe}
            onChange={(e) => setDetalhe(e.target.value)}
            aria-invalid={tentou && faltaDetalhe}
          />
          {tentou && faltaDetalhe && <FieldError>Conte o motivo.</FieldError>}
        </Field>
        <DialogFooter>
          <Button variant="outline" onClick={fechar}>
            Cancelar
          </Button>
          <Button className="bg-risco hover:bg-[#8C1D17]" onClick={confirmar}>
            Encerrar acompanhamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
