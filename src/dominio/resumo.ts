import { dataCurta, semanasEntre } from './hoje'
import { ESTRESSORES, pontuacao } from './phq9'
import type { Acompanhamento, CadastroEsus, Estressor, Resposta, ResumoEncaminhamento } from './tipos'

export function estressoresMaisMarcados(respostas: Resposta[]): { estressor: Estressor; vezes: number }[] {
  const contagem = new Map<Estressor, number>()
  for (const resposta of respostas.slice(-4)) {
    for (const e of resposta.estressores) contagem.set(e, (contagem.get(e) ?? 0) + 1)
  }
  return ESTRESSORES.filter((e) => contagem.has(e.id))
    .map((e) => ({ estressor: e.id, vezes: contagem.get(e.id)! }))
    .sort((a, b) => b.vezes - a.vezes)
}

export interface LeituraPergunta9 {
  positiva: boolean
  titulo: string
  detalhe?: string
}

const vezes = (n: number, singular: string, plural: string) => `${n} ${n === 1 ? singular : plural}`

// Lê o histórico da pergunta 9 pela sequência mais recente, que é o que muda a conduta.
export function lerPergunta9(historico: { data: string; valor: number }[]): LeituraPergunta9 {
  const n = historico.length
  if (n === 0) return { positiva: false, titulo: 'Sem respostas' }
  const positivas = historico.filter((h) => h.valor > 0)
  let seguidas = 0
  while (seguidas < n && historico[n - 1 - seguidas].valor > 0) seguidas++

  if (seguidas >= 2) {
    const inicio = historico[n - seguidas].data
    return {
      positiva: true,
      titulo: `Positiva há ${vezes(semanasEntre(inicio, historico[n - 1].data), 'semana', 'semanas')}`,
      detalhe: `Nas últimas ${seguidas} respostas, desde ${dataCurta(inicio)}`,
    }
  }
  if (seguidas === 1) {
    return {
      positiva: true,
      titulo: 'Positiva na última resposta',
      detalhe:
        positivas.length === 1 ? 'Primeira vez neste acompanhamento' : `Positiva em ${positivas.length} de ${n} respostas`,
    }
  }
  if (positivas.length > 0) {
    return {
      positiva: false,
      titulo: 'Negativa na última resposta',
      detalhe: `Positiva em ${positivas.length} de ${n}, a última em ${dataCurta(positivas.at(-1)!.data)}`,
    }
  }
  return { positiva: false, titulo: 'Sempre negativa', detalhe: n === 1 ? 'Na única resposta' : `Nas ${n} respostas` }
}

// R.F. 008: a parte do encaminhamento que sai do sistema.
export function resumoEncaminhamento(
  cadastro: CadastroEsus,
  acompanhamento: Acompanhamento,
  respostas: Resposta[],
  hoje: string,
): ResumoEncaminhamento {
  const primeira = respostas.at(0)
  const ultima = respostas.at(-1)
  return {
    pontuacaoInicial: primeira ? pontuacao(primeira.itens) : null,
    pontuacaoAtual: ultima ? pontuacao(ultima.itens) : null,
    semanas: semanasEntre(acompanhamento.inicio, hoje),
    pergunta9: respostas.map((r) => ({ data: r.data, valor: r.itens[8] })),
    estressores: estressoresMaisMarcados(respostas),
    contexto: {
      escolaridade: cadastro.escolaridade,
      trabalho: cadastro.trabalho,
      grupoComunitario: cadastro.grupoComunitario,
    },
  }
}
