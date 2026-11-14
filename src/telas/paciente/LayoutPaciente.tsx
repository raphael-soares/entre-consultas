import { Outlet } from 'react-router'
import { MolduraCelular } from '@/componentes/MolduraCelular'

export function LayoutPaciente() {
  return (
    <MolduraCelular legenda="Site do paciente, aberto no celular">
      <Outlet />
    </MolduraCelular>
  )
}
