import type { Perfil } from '@/dominio/tipos'

export const INICIO_DO_PERFIL: Record<Perfil, string> = {
  paciente: '/paciente',
  profissional: '/equipe',
  psiquiatra: '/psiquiatra',
}
