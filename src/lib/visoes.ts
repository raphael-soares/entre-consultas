import { useNavigate } from 'react-router'
import { USUARIOS } from '@/dados/fixtures'
import { useStore } from '@/estado/store'
import { INICIO_DO_PERFIL } from '@/lib/rotas'

export type Visao = { chave: string; nome: string; papel: string; usuarioId?: string }

const pessoa = (id: string, papel: string): Visao => {
  const u = USUARIOS.find((x) => x.id === id)!
  return { chave: id, nome: u.nome.split(' ').at(-2)!, papel, usuarioId: id }
}

export const VISOES: Visao[] = [
  { chave: 'whatsapp', nome: 'Ana', papel: 'Paciente, WhatsApp' },
  pessoa('fernanda', 'Paciente, site'),
  pessoa('juliana', 'Enfermeira'),
  pessoa('marcos', 'Psiquiatra'),
]

export function useAbrirVisao() {
  const navigate = useNavigate()
  const entrarComo = useStore((s) => s.entrarComo)
  return (v: Visao) => {
    if (!v.usuarioId) return navigate('/whatsapp?passo=lembrete')
    const u = USUARIOS.find((x) => x.id === v.usuarioId)!
    entrarComo(u.id)
    navigate(INICIO_DO_PERFIL[u.perfil])
  }
}
