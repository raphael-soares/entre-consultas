import { Navigate, Outlet } from 'react-router'
import type { Perfil } from '@/dominio/tipos'
import { useUsuarioLogado } from '@/estado/store'
import { INICIO_DO_PERFIL } from '@/lib/rotas'

// R.N. 005 e 006: cada perfil só abre as próprias telas.
export function Protegida({ perfil }: { perfil: Perfil }) {
  const usuario = useUsuarioLogado()
  if (!usuario) return <Navigate to="/login" replace />
  if (usuario.perfil !== perfil) return <Navigate to={INICIO_DO_PERFIL[usuario.perfil]} replace />
  return <Outlet />
}

export function Inicio() {
  const usuario = useUsuarioLogado()
  return <Navigate to={usuario ? INICIO_DO_PERFIL[usuario.perfil] : '/login'} replace />
}
