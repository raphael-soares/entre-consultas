import { MousePointerClick } from 'lucide-react'
import { EstadoVazio } from '@/componentes/EstadoVazio'

export function InicioEquipe() {
  return (
    <EstadoVazio
      icone={MousePointerClick}
      titulo="Escolha um paciente"
      texto="A lista está em ordem de prioridade: Risco, Piorou, Sem resposta, Sugere encaminhamento e Em dia."
      className="h-full"
    />
  )
}
