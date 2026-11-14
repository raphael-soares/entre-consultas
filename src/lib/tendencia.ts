import { diasEntre, HOJE, semanasEntre } from '@/dominio/hoje'
import { pontuacao } from '@/dominio/phq9'
import type { Ficha } from '@/estado/consultas'

const plural = (n: number, singular: string, plural: string) => `${n} ${n === 1 ? singular : plural}`

function variacao(respostas: Ficha['respostas']): string {
  const primeira = respostas[0]
  const ultima = respostas.at(-1)!
  if (respostas.length === 1) return `Uma resposta até agora, com ${plural(pontuacao(ultima.itens), 'ponto', 'pontos')}.`
  const dif = pontuacao(ultima.itens) - pontuacao(primeira.itens)
  const semanas = semanasEntre(primeira.data, ultima.data)
  const prazo = semanas >= 1 ? plural(semanas, 'semana', 'semanas') : plural(diasEntre(primeira.data, ultima.data), 'dia', 'dias')
  if (dif === 0) return `Sem mudança em ${prazo}.`
  return `${dif > 0 ? 'Subiu' : 'Caiu'} ${plural(Math.abs(dif), 'ponto', 'pontos')} em ${prazo}.`
}

function pensamentos(respostas: Ficha['respostas']): string | null {
  const valores = respostas.map((r) => r.itens[8])
  let seguidas = 0
  while (seguidas < valores.length && valores[valores.length - 1 - seguidas] > 0) seguidas++
  if (seguidas === 0) return null
  if (seguidas >= 2) return `Pensa em se ferir há ${seguidas} respostas seguidas.`
  return valores.filter((v) => v > 0).length === 1
    ? 'Pensou em se ferir pela primeira vez.'
    : 'Pensou em se ferir na última resposta.'
}

// Uma frase de tendência, só com o que já está nos dados: variação, pensamentos de se ferir ou atraso.
export function fraseTendencia(ficha: Pick<Ficha, 'respostas' | 'destaques' | 'prevista'>): string {
  if (ficha.respostas.length === 0) return 'Ainda sem respostas.'
  const extra =
    pensamentos(ficha.respostas) ??
    (ficha.destaques.includes('sem-resposta')
      ? `Questionário atrasado há ${plural(diasEntre(ficha.prevista, HOJE), 'dia', 'dias')}.`
      : null)
  return [variacao(ficha.respostas), extra].filter(Boolean).join(' ')
}
