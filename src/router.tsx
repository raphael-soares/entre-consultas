import { createBrowserRouter } from 'react-router'
import { Inicio, Protegida } from '@/componentes/Protegida'
import { Raiz } from '@/componentes/Raiz'
import { Abrir } from '@/telas/equipe/Abrir'
import { Encaminhar } from '@/telas/equipe/Encaminhar'
import { Evolucao } from '@/telas/equipe/Evolucao'
import { InicioEquipe } from '@/telas/equipe/InicioEquipe'
import { LayoutEquipe } from '@/telas/equipe/LayoutEquipe'
import { Registrar } from '@/telas/equipe/Registrar'
import { Login } from '@/telas/login/Login'
import { InicioPaciente } from '@/telas/paciente/InicioPaciente'
import { LayoutPaciente } from '@/telas/paciente/LayoutPaciente'
import { Questionario } from '@/telas/paciente/Questionario'
import { Respostas } from '@/telas/paciente/Respostas'
import { DetalheEncaminhamento } from '@/telas/psiquiatra/DetalheEncaminhamento'
import { LayoutPsiquiatra } from '@/telas/psiquiatra/LayoutPsiquiatra'
import { ListaEncaminhamentos } from '@/telas/psiquiatra/ListaEncaminhamentos'
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
      {
        path: 'equipe',
        element: <Protegida perfil="profissional" />,
        children: [
          {
            element: <LayoutEquipe />,
            children: [
              { index: true, element: <InicioEquipe /> },
              { path: 'abrir', element: <Abrir /> },
              { path: 'pacientes/:id', element: <Evolucao /> },
              { path: 'pacientes/:id/registrar', element: <Registrar /> },
              { path: 'pacientes/:id/encaminhar', element: <Encaminhar /> },
            ],
          },
        ],
      },
      {
        path: 'psiquiatra',
        element: <Protegida perfil="psiquiatra" />,
        children: [
          {
            element: <LayoutPsiquiatra />,
            children: [
              { index: true, element: <ListaEncaminhamentos /> },
              { path: 'encaminhamentos/:id', element: <DetalheEncaminhamento /> },
            ],
          },
        ],
      },
      { path: '*', element: <Inicio /> },
    ],
  },
])
