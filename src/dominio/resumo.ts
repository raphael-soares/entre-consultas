import { semanasEntre } from './hoje'
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
