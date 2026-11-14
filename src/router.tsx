import { createBrowserRouter } from 'react-router'
import { Inicio, Protegida } from '@/componentes/Protegida'
import { Raiz } from '@/componentes/Raiz'
import { Login } from '@/telas/login/Login'
import { InicioPaciente } from '@/telas/paciente/InicioPaciente'
import { LayoutPaciente } from '@/telas/paciente/LayoutPaciente'
import { Questionario } from '@/telas/paciente/Questionario'
import { Respostas } from '@/telas/paciente/Respostas'
import { WhatsApp } from '@/telas/whatsapp/WhatsApp'

export const router = createBrowserRouter([
  {
    element: <Raiz />,
    children: [
      { index: true, element: <Inicio /> },
      { path: 'login', element: <Login /> },
      { path: 'whatsapp', element: <WhatsApp /> },
      {
        path: 'paciente',
        element: <Protegida perfil="paciente" />,
        children: [
          {
            element: <LayoutPaciente />,
            children: [
              { index: true, element: <InicioPaciente /> },
              { path: 'questionario', element: <Questionario /> },
              { path: 'respostas', element: <Respostas /> },
            ],
          },
        ],
      },
      { path: '*', element: <Inicio /> },
    ],
  },
])
