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

export function nomeDoUsuario(id: string): string {
  return USUARIOS.find((u) => u.id === id)?.nome ?? id
}

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
  { id: 'tereza', nome: 'Tereza Lopes', nascimento: '1974-06-08', celular: '(47) 99512-8830', escolaridade: 'Ensino fundamental completo', trabalho: 'Diarista', grupoComunitario: 'Não participa' },
  { id: 'marcelo', nome: 'Marcelo Antunes', nascimento: '1988-01-17', celular: '(47) 99276-4419', escolaridade: 'Ensino superior completo', trabalho: 'Trabalha com carteira assinada', grupoComunitario: 'Não participa' },
  { id: 'patricia', nome: 'Patrícia Vieira', nascimento: '1997-10-03', celular: '(47) 99631-0072', escolaridade: 'Ensino médio completo', trabalho: 'Licença-maternidade', grupoComunitario: 'Grupo de gestantes da UBS' },
  { id: 'antonio', nome: 'Antônio Ferreira', nascimento: '1959-03-21', escolaridade: 'Ensino fundamental incompleto', trabalho: 'Aposentado', grupoComunitario: 'Não participa' },
  { id: 'rosangela', nome: 'Rosângela Prado', nascimento: '1981-12-12', celular: '(47) 99184-2265', escolaridade: 'Ensino médio incompleto', trabalho: 'Desempregada há 1 ano', grupoComunitario: 'Grupo de artesanato do CRAS' },
  { id: 'diego', nome: 'Diego Martins', nascimento: '2002-05-29', celular: '(47) 99708-3391', escolaridade: 'Ensino médio completo', trabalho: 'Trabalha por aplicativo', grupoComunitario: 'Não participa' },
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
  ...historico('tereza', [
    [68, 15, 'whatsapp', ['familia']],
    [54, 17, 'whatsapp', ['familia', 'dinheiro']],
    [40, 19, 'site', ['familia'], 1],
    [26, 20, 'whatsapp', ['familia', 'saude'], 1],
    [12, 22, 'whatsapp', ['familia', 'saude'], 2],
  ]),
  ...historico('marcelo', [
    [98, 15, 'site', ['trabalho']],
    [84, 16, 'site', ['trabalho']],
    [70, 16, 'whatsapp', ['trabalho', 'dinheiro']],
    [56, 17, 'site', ['trabalho']],
    [42, 16, 'whatsapp', ['trabalho']],
    [28, 16, 'site', ['trabalho', 'familia']],
    [14, 17, 'whatsapp', ['trabalho']],
  ]),
  ...historico('patricia', [
    [88, 21, 'whatsapp', ['familia']],
    [74, 19, 'whatsapp', ['familia', 'dinheiro']],
    [60, 17, 'whatsapp', ['familia']],
    [46, 15, 'site', ['familia']],
    [32, 14, 'whatsapp', ['familia']],
    [18, 14, 'whatsapp', ['familia', 'dinheiro']],
    [4, 13, 'whatsapp', ['familia']],
  ]),
  ...historico(
    'antonio',
    [
      [58, 14, 'visita', ['luto']],
      [37, 16, 'visita', ['luto', 'saude']],
      [16, 19, 'visita', ['luto', 'saude'], 1],
    ],
    'rafael',
  ),
  ...historico('rosangela', [
    [148, 20, 'whatsapp', ['dinheiro', 'moradia']],
    [134, 19, 'whatsapp', ['dinheiro', 'moradia']],
    [120, 18, 'site', ['dinheiro']],
    [106, 17, 'whatsapp', ['dinheiro', 'saude']],
    [92, 15, 'whatsapp', ['dinheiro']],
    [78, 14, 'whatsapp', ['saude']],
    [64, 13, 'site', ['dinheiro']],
    [50, 12, 'whatsapp', ['dinheiro']],
    [36, 12, 'whatsapp', ['saude']],
    [22, 11, 'whatsapp', ['dinheiro']],
    [8, 10, 'whatsapp', []],
  ]),
  ...historico('diego', [
    [82, 14, 'whatsapp', ['trabalho', 'familia']],
    [68, 16, 'whatsapp', ['familia'], 1],
    [54, 18, 'whatsapp', ['familia', 'moradia'], 1],
    [40, 17, 'site', ['moradia']],
    [26, 17, 'whatsapp', ['moradia', 'dinheiro']],
    [12, 18, 'whatsapp', ['moradia']],
  ]),
]

function acompanhamento(
  pacienteId: string,
  diasAtras: number,
  periodicidade: Periodicidade = 14,
  responsavelId = 'juliana',
): Acompanhamento {
  return {
    id: pacienteId,
    pacienteId,
    inicio: somarDias(HOJE, -diasAtras),
    periodicidade,
    responsavelId,
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
  acompanhamento('tereza', 70, 14, 'rafael'),
  acompanhamento('marcelo', 100, 14, 'rafael'),
  acompanhamento('patricia', 90, 14, 'rafael'),
  acompanhamento('antonio', 60, 21, 'rafael'),
  acompanhamento('rosangela', 150, 14, 'rafael'),
  acompanhamento('diego', 84, 14, 'rafael'),
]

function encaminhamento(
  pacienteId: string,
  diasAtras: number,
  profissionalId: string,
  textos: Pick<Encaminhamento, 'motivo' | 'prejuizoFuncional' | 'tratamentos'>,
): Encaminhamento {
  const data = somarDias(HOJE, -diasAtras)
  return {
    id: pacienteId,
    pacienteId,
    psiquiatraId: 'marcos',
    profissionalId,
    data,
    ...textos,
    resumo: resumoEncaminhamento(
      CADASTROS.find((c) => c.id === pacienteId)!,
      ACOMPANHAMENTOS.find((a) => a.id === pacienteId)!,
      RESPOSTAS.filter((r) => r.pacienteId === pacienteId && r.data <= data),
      data,
    ),
  }
}

export const ENCAMINHAMENTOS: Encaminhamento[] = [
  encaminhamento('roberto', 21, 'juliana', {
    motivo: 'Pensamentos de se ferir há 12 semanas seguidas e pontuação sem queda depois de 17 semanas de acompanhamento.',
    prejuizoFuncional: 'Afastado do trabalho há 3 meses. Deixou de sair de casa sozinho e de ir à igreja.',
    tratamentos: 'Fluoxetina 20 mg por 8 semanas e depois 40 mg por 6 semanas, sem melhora. Acompanhamento com a enfermagem da unidade.',
  }),
  encaminhamento('tereza', 3, 'rafael', {
    motivo: 'Pontuação subindo há dois meses, chegou a grave, e pensamentos de se ferir nas três últimas respostas.',
    prejuizoFuncional: 'Parou de aceitar faxinas e passa a maior parte do dia deitada.',
    tratamentos: 'Sertralina 50 mg há 6 semanas. Escuta com a enfermagem a cada 15 dias.',
  }),
  encaminhamento('marcelo', 9, 'rafael', {
    motivo: 'Moderadamente grave e sem queda depois de 13 semanas de acompanhamento.',
    prejuizoFuncional: 'Três atestados no último mês. Diz que não consegue se concentrar no trabalho.',
    tratamentos: 'Escitalopram 10 mg por 6 semanas e 20 mg por mais 6, sem melhora.',
  }),
  encaminhamento('patricia', 30, 'rafael', {
    motivo: 'Depressão pós-parto que melhorou no começo e estacionou em moderada.',
    prejuizoFuncional: 'Cuida do bebê com ajuda da mãe. Deixou de ir ao grupo de gestantes.',
    tratamentos: 'Sertralina 100 mg há 10 semanas, compatível com amamentação.',
  }),
  encaminhamento('antonio', 6, 'rafael', {
    motivo: 'Luto pela esposa há 4 meses, pontuação subindo e pensamento de se ferir na última visita.',
    prejuizoFuncional: 'Não sai de casa. Os filhos levam as refeições.',
    tratamentos: 'Nenhum medicamento. Visitas domiciliares da equipe a cada três semanas.',
  }),
  encaminhamento('rosangela', 100, 'rafael', {
    motivo: 'Pontuação entre 18 e 20 por mais de um mês, com dois antidepressivos diferentes.',
    prejuizoFuncional: 'Perdeu o emprego no período. Mora de favor com a irmã.',
    tratamentos: 'Fluoxetina 20 mg por 4 semanas, sem efeito. Trocada por amitriptilina 25 mg há 3 semanas.',
  }),
  encaminhamento('diego', 14, 'rafael', {
    motivo: 'Moderadamente grave há 8 semanas e pensamentos de se ferir em duas respostas.',
    prejuizoFuncional: 'Trabalha menos horas por aplicativo e atrasou o aluguel.',
    tratamentos: 'Fluoxetina 20 mg há 8 semanas. Encaminhado ao CRAS pela moradia.',
  }),
]

export const TRANSFERENCIAS: Transferencia[] = []
