import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { EscolhaUnica } from '@/componentes/EscolhaUnica'
import { Segmentado } from '@/componentes/Segmentado'
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
import { USUARIOS, nomeDoUsuario } from '@/dados/fixtures'
import { MOTIVOS_TRANSFERENCIA } from '@/dominio/rotulos'
import type { MotivoTransferencia, Transferencia } from '@/dominio/tipos'
import type { Ficha } from '@/estado/consultas'
import { useStore } from '@/estado/store'

type Tipo = Transferencia['tipo']

const MOTIVOS = Object.entries(MOTIVOS_TRANSFERENCIA).map(([valor, rotulo]) => ({
  valor: valor as MotivoTransferencia,
  rotulo,
}))

// R.N. 010: acompanhamento vai para alguém da mesma equipe; encaminhamento, para outro psiquiatra.
export function DialogoTransferir({ aberto, fechar, ficha }: { aberto: boolean; fechar: () => void; ficha: Ficha }) {
  const transferir = useStore((s) => s.transferir)
  const navigate = useNavigate()
  const [tipo, setTipo] = useState<Tipo>('acompanhamento')
  const [destino, setDestino] = useState<string>()
  const [motivo, setMotivo] = useState<MotivoTransferencia>()
  const [detalhe, setDetalhe] = useState('')
  const [tentou, setTentou] = useState(false)

  const atual = tipo === 'acompanhamento' ? ficha.acompanhamento.responsavelId : ficha.encaminhamento?.psiquiatraId
  const destinos = USUARIOS.filter(
    (u) => u.perfil === (tipo === 'acompanhamento' ? 'profissional' : 'psiquiatra') && u.id !== atual,
  ).map((u) => ({ valor: u.id, rotulo: `${u.nome}, ${u.funcao.toLowerCase()}` }))
  const faltaDetalhe = motivo === 'outro' && !detalhe.trim()

  function trocarTipo(novo: Tipo) {
    setTipo(novo)
    setDestino(undefined)
  }

  function confirmar() {
    setTentou(true)
    if (!destino || !motivo || faltaDetalhe) return
    transferir({ tipo, pacienteId: ficha.cadastro.id, paraId: destino, motivo, detalhe: detalhe.trim() || undefined })
    const primeiroNome = ficha.cadastro.nome.split(' ')[0]
    if (tipo === 'acompanhamento') {
      toast.success(`${primeiroNome} agora está com ${nomeDoUsuario(destino)}.`)
      navigate('/equipe')
    } else {
      toast.success(`Encaminhamento de ${primeiroNome} redirecionado para ${nomeDoUsuario(destino)}.`)
      fechar()
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && fechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transferir {ficha.cadastro.nome}</DialogTitle>
          <DialogDescription>O histórico vai junto e a transferência fica registrada.</DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel className="text-[15px]">O que transferir</FieldLabel>
          <Segmentado
            rotulo="O que transferir"
            valor={tipo}
            aoMudar={trocarTipo}
            className="w-full"
            opcoes={[
              { valor: 'acompanhamento', rotulo: 'Acompanhamento' },
              { valor: 'encaminhamento', rotulo: 'Encaminhamento', desabilitada: !ficha.encaminhamento },
            ]}
          />
        </Field>
        <Field data-invalid={tentou && !destino}>
          <FieldLabel className="text-[15px]">
            {tipo === 'acompanhamento' ? 'Novo responsável' : 'Novo psiquiatra'}
          </FieldLabel>
          <EscolhaUnica
            rotulo="Destino"
            valor={destino}
            aoMudar={setDestino}
            opcoes={destinos}
            invalido={tentou && !destino}
          />
          {tentou && !destino && <FieldError>Escolha para quem vai.</FieldError>}
        </Field>
        <Field data-invalid={tentou && !motivo}>
          <FieldLabel className="text-[15px]">Motivo</FieldLabel>
          <EscolhaUnica
            rotulo="Motivo da transferência"
            valor={motivo}
            aoMudar={setMotivo}
            opcoes={MOTIVOS}
            invalido={tentou && !motivo}
            className="grid-cols-2"
          />
          {tentou && !motivo && <FieldError>Escolha o motivo.</FieldError>}
        </Field>
        {motivo === 'outro' && (
          <Field data-invalid={tentou && faltaDetalhe}>
            <FieldLabel htmlFor="detalhe-transferir" className="text-[15px]">
              Qual?
            </FieldLabel>
            <Textarea
              id="detalhe-transferir"
              value={detalhe}
              onChange={(e) => setDetalhe(e.target.value)}
              aria-invalid={tentou && faltaDetalhe}
            />
            {tentou && faltaDetalhe && <FieldError>Conte o motivo.</FieldError>}
          </Field>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={fechar}>
            Cancelar
          </Button>
          <Button onClick={confirmar}>Transferir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
