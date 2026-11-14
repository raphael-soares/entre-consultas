import { dataLonga } from '@/dominio/hoje'
import { CVV, ENUNCIADO, OPCOES, PERGUNTAS, nomeEstressor } from '@/dominio/phq9'
import type { Rascunho } from '@/estado/store'

export type Passo = 'lembrete' | `pergunta-${number}` | 'alerta' | 'estressores' | 'outro' | 'mais' | 'fim'

export interface Mensagem {
  de: 'equipe' | 'paciente'
  texto: string
  hora: string
  separador?: string
  alerta?: boolean
  botoes?: string[]
  lista?: string
}

export const PERGUNTA_ESTRESSORES = 'Nas últimas 2 semanas, alguma destas situações pesou para você?'
const OUTRA_SITUACAO = 'Qual outra situação?'
const QUAL_OUTRO = 'Qual foi a situação? Pode escrever aqui embaixo.'
const MAIS_ALGUMA = 'Mais alguma?'
export const BOTOES_LEMBRETE = ['Responder aqui', 'Responder no site']
export const BOTOES_ALERTA = ['Ligar para o CVV', 'Continuar']
export const BOTOES_MAIS = ['Sim', 'Não, terminar']

export function textosLembrete(nome: string, equipe: string, unidade: string): string[] {
  return [
    `Olá, ${nome}! Aqui é a ${equipe}, da ${unidade}. Chegou o dia do seu questionário de acompanhamento: são 9 perguntas rápidas sobre as últimas 2 semanas.`,
    `Oi, ${nome}. Ainda dá tempo de responder o questionário. Leva uns 3 minutos, aqui mesmo ou no site.`,
  ]
}

export function montarConversa(
  rascunho: Rascunho | undefined,
  passo: Passo,
  lembretes: { data: string; texto: string }[],
  nome: string,
): Mensagem[] {
  const mensagens: Mensagem[] = lembretes.map((l) => ({
    de: 'equipe',
    texto: l.texto,
    hora: '09:00',
    separador: dataLonga(l.data),
    botoes: BOTOES_LEMBRETE,
  }))
  if (passo === 'lembrete' || !rascunho) return mensagens

  const inicioHoje = mensagens.length
  const enviar = (m: Omit<Mensagem, 'hora'>) => {
    const minuto = 4 + Math.floor((mensagens.length - inicioHoje) / 3)
    mensagens.push({ ...m, hora: `14:${String(minuto).padStart(2, '0')}` })
  }
  enviar({ de: 'paciente', texto: BOTOES_LEMBRETE[0], separador: 'Hoje' })

  for (let i = 0; i < 9; i++) {
    const intro = i === 0 ? `${ENUNCIADO}\n\n` : ''
    enviar({ de: 'equipe', texto: `Pergunta ${i + 1} de 9\n\n${intro}${PERGUNTAS[i]}`, lista: 'Escolher resposta' })
    const valor = rascunho.itens[i]
    if (valor === null) return mensagens
    enviar({ de: 'paciente', texto: OPCOES[valor] })
  }

  if (rascunho.itens[8]! > 0) {
    enviar({
      de: 'equipe',
      alerta: true,
      texto: `${CVV.texto}\n\nSua equipe vai ver esta resposta, mas não acompanha as mensagens em tempo real. Em emergência, ligue 192 (SAMU).`,
      botoes: BOTOES_ALERTA,
    })
    if (passo === 'alerta') return mensagens
    enviar({ de: 'paciente', texto: BOTOES_ALERTA[1] })
  }

  const escolhidos = rascunho.estressores
  if (escolhidos.length === 0) {
    enviar({ de: 'equipe', texto: PERGUNTA_ESTRESSORES, lista: 'Ver situações' })
    if (passo === 'fim') enviar({ de: 'paciente', texto: 'Nenhuma delas' })
  }
  for (const [j, e] of escolhidos.entries()) {
    enviar({ de: 'equipe', texto: j === 0 ? PERGUNTA_ESTRESSORES : OUTRA_SITUACAO, lista: 'Ver situações' })
    enviar({ de: 'paciente', texto: nomeEstressor(e) })
    if (e === 'outro') {
      enviar({ de: 'equipe', texto: QUAL_OUTRO })
      if (passo === 'outro') return mensagens
      enviar({ de: 'paciente', texto: rascunho.outroEstressor ?? '' })
    }
    enviar({ de: 'equipe', texto: MAIS_ALGUMA, botoes: BOTOES_MAIS })
    if (j < escolhidos.length - 1) enviar({ de: 'paciente', texto: BOTOES_MAIS[0] })
  }
  if (passo === 'estressores' && escolhidos.length > 0) {
    enviar({ de: 'paciente', texto: BOTOES_MAIS[0] })
    enviar({ de: 'equipe', texto: OUTRA_SITUACAO, lista: 'Ver situações' })
  }
  if (passo === 'fim') {
    if (escolhidos.length > 0) enviar({ de: 'paciente', texto: BOTOES_MAIS[1] })
    enviar({
      de: 'equipe',
      texto: `Obrigado, ${nome}. Suas respostas foram enviadas para a sua equipe. Avisamos aqui quando for a hora do próximo questionário.`,
    })
  }
  return mensagens
}
