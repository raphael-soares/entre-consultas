import type { Canal, Estressor } from './tipos'

export const ENUNCIADO =
  'Nas últimas 2 semanas, com que frequência você foi incomodado(a) por algum destes problemas?'

export const PERGUNTAS = [
  'Pouco interesse ou pouco prazer em fazer as coisas',
  'Se sentir para baixo, deprimido(a) ou sem perspectiva',
  'Dificuldade para pegar no sono ou permanecer dormindo, ou dormir mais do que de costume',
  'Se sentir cansado(a) ou com pouca energia',
  'Falta de apetite ou comer demais',
  'Se sentir mal consigo mesmo(a), achar que é um fracasso ou que decepcionou sua família ou você mesmo(a)',
  'Dificuldade para se concentrar nas coisas, como ler o jornal ou ver televisão',
  'Lentidão para se movimentar ou falar, a ponto de outras pessoas perceberem; ou o oposto, estar tão agitado(a) que fica andando de um lado para o outro mais do que de costume',
  'Pensar em se ferir de alguma maneira ou que seria melhor estar morto(a)',
] as const

export const PERGUNTAS_CURTAS = [
  'Pouco interesse ou prazer',
  'Para baixo, sem perspectiva',
  'Problemas de sono',
  'Cansaço ou pouca energia',
  'Apetite',
  'Sentir-se mal consigo',
  'Dificuldade de concentração',
  'Lentidão ou agitação',
  'Pensar em se ferir',
] as const

export const OPCOES = ['Nenhuma vez', 'Vários dias', 'Mais da metade dos dias', 'Quase todos os dias'] as const

export const ESTRESSORES: { id: Estressor; nome: string }[] = [
  { id: 'trabalho', nome: 'Trabalho ou desemprego' },
  { id: 'familia', nome: 'Família ou relacionamentos' },
  { id: 'dinheiro', nome: 'Dinheiro' },
  { id: 'saude', nome: 'Saúde física' },
  { id: 'moradia', nome: 'Moradia' },
  { id: 'luto', nome: 'Luto' },
  { id: 'outro', nome: 'Outro' },
]

export function nomeEstressor(id: Estressor): string {
  return ESTRESSORES.find((e) => e.id === id)!.nome
}

export const CANAIS: Record<Canal, string> = {
  whatsapp: 'WhatsApp',
  site: 'Site',
  unidade: 'Na unidade',
  visita: 'Visita domiciliar',
}

export const COMO_RESPONDEU: Record<Canal, string> = {
  whatsapp: 'Pelo WhatsApp',
  site: 'Pelo site',
  unidade: 'Registrada na unidade',
  visita: 'Registrada em visita domiciliar',
}

export const CVV = {
  telefone: '188',
  texto: 'Se você está pensando em se ferir, ligue para o CVV no 188. A ligação é gratuita e o atendimento funciona 24 horas.',
}

export type FaixaId = 'minima' | 'leve' | 'moderada' | 'moderadamente-grave' | 'grave'

export interface Faixa {
  id: FaixaId
  nome: string
  min: number
  max: number
  cor: string
  ordem: number
}

export const FAIXAS: Faixa[] = [
  { id: 'minima', nome: 'Mínima', min: 0, max: 4, cor: '#1B7F3B', ordem: 0 },
  { id: 'leve', nome: 'Leve', min: 5, max: 9, cor: '#7A6400', ordem: 1 },
  { id: 'moderada', nome: 'Moderada', min: 10, max: 14, cor: '#B35900', ordem: 2 },
  { id: 'moderadamente-grave', nome: 'Moderadamente grave', min: 15, max: 19, cor: '#C2410C', ordem: 3 },
  { id: 'grave', nome: 'Grave', min: 20, max: 27, cor: '#B3261E', ordem: 4 },
]

export function pontuacao(itens: number[]): number {
  return itens.reduce((soma, item) => soma + item, 0)
}

export function faixa(p: number): Faixa {
  return FAIXAS.find((f) => p >= f.min && p <= f.max)!
}

// R.N. 002
export function rastreioPositivo(p: number): boolean {
  return p >= 9
}

export function pergunta9Positiva(itens: number[]): boolean {
  return itens[8] > 0
}
