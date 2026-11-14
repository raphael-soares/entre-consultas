import { HOJE, somarDias } from '@/dominio/hoje'
import { resumoEncaminhamento } from '@/dominio/resumo'
import type {
  Acompanhamento,
  CadastroEsus,
  Canal,
  Encaminhamento,
  Estressor,
  Periodicidade,
  Resposta,
  Transferencia,
  Usuario,
} from '@/dominio/tipos'

export const UNIDADE = 'UBS Bela Vista (fictícia)'
export const EQUIPE = 'Equipe Azul'
export const SENHA_DEMO = 'demo1234'

export const USUARIOS: Usuario[] = [
  { id: 'fernanda', nome: 'Fernanda Rodrigues', perfil: 'paciente', funcao: 'Paciente', cpf: '111.111.111-11', senha: SENHA_DEMO, pacienteId: 'fernanda' },
  { id: 'juliana', nome: 'Enf. Juliana Costa', perfil: 'profissional', funcao: 'Enfermeira', cpf: '222.222.222-22', senha: SENHA_DEMO },
  { id: 'rafael', nome: 'Dr. Rafael Souza', perfil: 'profissional', funcao: 'Médico de família' },
  { id: 'marcos', nome: 'Dr. Marcos Lima', perfil: 'psiquiatra', funcao: 'Psiquiatra', cpf: '333.333.333-33', senha: SENHA_DEMO },
  { id: 'helena', nome: 'Dra. Helena Rocha', perfil: 'psiquiatra', funcao: 'Psiquiatra' },
]

export const CADASTROS: CadastroEsus[] = [
  { id: 'maria', nome: 'Maria Aparecida Santos', nascimento: '1979-03-14', celular: '(47) 99812-3401', escolaridade: 'Ensino fundamental completo', trabalho: 'Desempregada há 8 meses', grupoComunitario: 'Não participa' },
  { id: 'joao', nome: 'João Pedro Almeida', nascimento: '1995-07-02', celular: '(47) 99745-1180', escolaridade: 'Ensino médio completo', trabalho: 'Trabalha sem carteira assinada', grupoComunitario: 'Não participa' },
  { id: 'ana', nome: 'Ana Beatriz Oliveira', nascimento: '1988-11-20', celular: '(47) 99630-2257', escolaridade: 'Ensino médio completo', trabalho: 'Autônoma (costureira)', grupoComunitario: 'Grupo de caminhada da UBS' },
  { id: 'carlos', nome: 'Carlos Henrique Pereira', nascimento: '1971-01-09', celular: '(47) 99158-7702', escolaridade: 'Ensino fundamental incompleto', trabalho: 'Aposentado por invalidez', grupoComunitario: 'Não participa' },
  { id: 'fernanda', nome: 'Fernanda Rodrigues', nascimento: '1992-05-27', celular: '(47) 99921-4410', escolaridade: 'Ensino superior completo', trabalho: 'Trabalha com carteira assinada', grupoComunitario: 'Não participa' },
  { id: 'paulo', nome: 'Paulo César Gomes', nascimento: '1985-09-30', celular: '(47) 99377-0918', escolaridade: 'Ensino médio incompleto', trabalho: 'Desempregado há 2 meses', grupoComunitario: 'Não participa' },
  { id: 'luciana', nome: 'Luciana Moreira', nascimento: '1958-04-11', escolaridade: 'Ensino fundamental incompleto', trabalho: 'Dona de casa', grupoComunitario: 'Grupo de convivência da igreja' },
  { id: 'roberto', nome: 'Roberto Carvalho', nascimento: '1966-12-03', celular: '(47) 99204-6631', escolaridade: 'Ensino médio completo', trabalho: 'Afastado pelo INSS', grupoComunitario: 'Não participa' },
  { id: 'sebastiao', nome: 'Sebastião Ribeiro', nascimento: '1960-08-15', celular: '(47) 99488-1275', escolaridade: 'Ensino fundamental incompleto', trabalho: 'Aposentado', grupoComunitario: 'Horta comunitária' },
  { id: 'claudia', nome: 'Cláudia Nunes', nascimento: '1990-02-22', celular: '(47) 99863-5540', escolaridade: 'Ensino médio completo', trabalho: 'Trabalha com carteira assinada', grupoComunitario: 'Não participa' },
]

// Itens 1 e 2 (interesse e humor) sobem primeiro; o 9 vem à parte.
const ORDEM_ITENS = [1, 0, 3, 5, 6, 2, 4, 7]

export function itensPara(total: number, pergunta9 = 0): number[] {
  const itens = Array<number>(9).fill(0)
  itens[8] = pergunta9
  let resto = total - pergunta9
  while (resto > 0) {
    for (const i of ORDEM_ITENS) {
      if (resto === 0) break
      if (itens[i] < 3) {
        itens[i]++
        resto--
      }
    }
  }
  return itens
}

type Linha = [diasAtras: number, total: number, canal: Canal, estressores: Estressor[], pergunta9?: number]

function historico(pacienteId: string, linhas: Linha[], registradoPor?: string): Resposta[] {
  return linhas.map(([diasAtras, total, canal, estressores, pergunta9 = 0], i) => ({
    id: `${pacienteId}-${i + 1}`,
    pacienteId,
    data: somarDias(HOJE, -diasAtras),
    canal,
    itens: itensPara(total, pergunta9),
    estressores,
    ...(estressores.includes('outro') ? { outroEstressor: 'Vizinho barulhento' } : {}),
    ...(canal === 'unidade' || canal === 'visita' ? { registradoPor } : {}),
  }))
}

export const RESPOSTAS: Resposta[] = [
  ...historico('maria', [
    [44, 12, 'whatsapp', ['dinheiro', 'trabalho']],
    [30, 14, 'site', ['dinheiro', 'familia']],
    [16, 13, 'whatsapp', ['dinheiro']],
    [2, 15, 'whatsapp', ['dinheiro', 'familia', 'trabalho'], 1],
  ]),
  ...historico('joao', [
    [32, 8, 'site', ['trabalho']],
    [18, 9, 'whatsapp', ['trabalho', 'familia']],
    [4, 16, 'whatsapp', ['familia', 'trabalho', 'moradia']],
  ]),
  ...historico('ana', [
    [52, 15, 'whatsapp', ['luto', 'familia']],
    [38, 13, 'whatsapp', ['luto']],
    [24, 12, 'whatsapp', ['luto', 'dinheiro']],
  ]),
  ...historico('carlos', [
    [124, 17, 'site', ['saude']],
    [110, 17, 'whatsapp', ['saude', 'dinheiro']],
    [96, 16, 'whatsapp', ['saude']],
    [82, 17, 'site', ['saude', 'familia']],
    [68, 16, 'whatsapp', ['saude']],
    [54, 16, 'whatsapp', ['saude', 'dinheiro']],
    [40, 15, 'site', ['saude']],
    [26, 16, 'whatsapp', ['saude', 'outro']],
    [12, 15, 'whatsapp', ['saude', 'dinheiro']],
  ]),
  ...historico('fernanda', [
    [76, 19, 'site', ['trabalho', 'familia']],
    [62, 17, 'site', ['trabalho', 'familia']],
    [48, 14, 'site', ['trabalho']],
    [34, 12, 'site', ['trabalho', 'saude']],
    [20, 10, 'site', ['trabalho']],
    [6, 8, 'site', ['trabalho']],
  ]),
  ...historico('paulo', [[13, 13, 'whatsapp', ['trabalho', 'dinheiro']]]),
  ...historico(
    'luciana',
    [
      [57, 16, 'visita', ['saude', 'luto']],
      [36, 14, 'visita', ['saude']],
      [15, 11, 'visita', ['saude', 'familia']],
    ],
    'juliana',
  ),
  ...historico('roberto', [
    [138, 20, 'whatsapp', ['trabalho', 'dinheiro']],
    [124, 20, 'whatsapp', ['trabalho', 'dinheiro']],
    [110, 19, 'whatsapp', ['trabalho'], 1],
    [96, 20, 'site', ['trabalho', 'familia'], 1],
    [82, 19, 'whatsapp', ['dinheiro'], 1],
    [68, 19, 'whatsapp', ['trabalho', 'dinheiro'], 1],
    [54, 18, 'whatsapp', ['trabalho'], 2],
    [40, 19, 'site', ['trabalho', 'dinheiro'], 1],
    [26, 18, 'whatsapp', ['dinheiro'], 1],
    [16, 18, 'whatsapp', ['trabalho']],
  ]),
]

function acompanhamento(pacienteId: string, diasAtras: number, periodicidade: Periodicidade = 14): Acompanhamento {
  return {
    id: pacienteId,
    pacienteId,
    inicio: somarDias(HOJE, -diasAtras),
    periodicidade,
    responsavelId: 'juliana',
  }
}

export const ACOMPANHAMENTOS: Acompanhamento[] = [
  acompanhamento('maria', 44),
  acompanhamento('joao', 33),
  acompanhamento('ana', 54),
  acompanhamento('carlos', 126),
  acompanhamento('fernanda', 78),
  acompanhamento('paulo', 14),
  acompanhamento('luciana', 58, 21),
  acompanhamento('roberto', 140),
]

const DATA_ENCAMINHAMENTO_ROBERTO = somarDias(HOJE, -21)

export const ENCAMINHAMENTOS: Encaminhamento[] = [
  {
    id: 'roberto',
    pacienteId: 'roberto',
    psiquiatraId: 'marcos',
    profissionalId: 'juliana',
    data: DATA_ENCAMINHAMENTO_ROBERTO,
    motivo: 'Pergunta 9 positiva há 12 semanas seguidas e pontuação sem queda depois de 17 semanas de acompanhamento.',
    prejuizoFuncional: 'Afastado do trabalho há 3 meses. Deixou de sair de casa sozinho e de ir à igreja.',
    tratamentos: 'Fluoxetina 20 mg por 8 semanas e depois 40 mg por 6 semanas, sem melhora. Acompanhamento com a enfermagem da unidade.',
    resumo: resumoEncaminhamento(
      CADASTROS.find((c) => c.id === 'roberto')!,
      ACOMPANHAMENTOS.find((a) => a.id === 'roberto')!,
      RESPOSTAS.filter((r) => r.pacienteId === 'roberto' && r.data <= DATA_ENCAMINHAMENTO_ROBERTO),
      DATA_ENCAMINHAMENTO_ROBERTO,
    ),
  },
]

export const TRANSFERENCIAS: Transferencia[] = []
