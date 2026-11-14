import { ChevronLeft, FileX } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { CartaoAgora } from '@/componentes/CartaoAgora'
import { CartaoLateral, ContextoPaciente } from '@/componentes/ContextoPaciente'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import { GraficoEvolucao } from '@/componentes/GraficoEvolucao'
import { Button } from '@/componentes/ui/button'
import { CADASTROS, UNIDADE, nomeDoUsuario } from '@/dados/fixtures'
import { HOJE, dataLonga, idade } from '@/dominio/hoje'
import { montarFicha, useDados } from '@/estado/consultas'
import { acompanhamentoAtivo, useUsuarioLogado } from '@/estado/store'

const VOLTAR = (
  <Button asChild variant="ghost" className="self-start px-2">
    <Link to="/psiquiatra">
      <ChevronLeft aria-hidden />
      Encaminhamentos recebidos
    </Link>
  </Button>
)

export function DetalheEncaminhamento() {
  const { id } = useParams()
  const usuario = useUsuarioLogado()!
  const dados = useDados()
  const encaminhamento = dados.encaminhamentos.find((e) => e.id === id && e.psiquiatraId === usuario.id)

  // Encerrado o acompanhamento, vale o que estava aberto na data do encaminhamento.
  const ficha = useMemo(() => {
    if (!encaminhamento) return null
    const { pacienteId, data } = encaminhamento
    const acomp =
      acompanhamentoAtivo(dados.acompanhamentos, pacienteId) ??
      dados.acompanhamentos.filter((a) => a.pacienteId === pacienteId && a.inicio <= data).at(-1)
    return montarFicha(dados, pacienteId, acomp)
  }, [dados, encaminhamento])

  if (!encaminhamento || !ficha) {
    return (
      <div className="flex flex-col gap-5">
        {VOLTAR}
        <EstadoVazio
          icone={FileX}
          titulo="Encaminhamento não encontrado"
          texto="Ele pode ter sido transferido para outro psiquiatra."
          className="rounded-xl bg-card py-16 ring-1 ring-border"
        />
      </div>
    )
  }

  const cadastro = CADASTROS.find((c) => c.id === encaminhamento.pacienteId)!
  const encerrado = !!ficha.acompanhamento.encerramento

  return (
    <div className="flex flex-col gap-5">
      {VOLTAR}
      <header>
        <h1 className="text-[34px] leading-tight font-bold tracking-tight">{cadastro.nome}</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">
          {idade(cadastro.nascimento, HOJE)} anos · {UNIDADE} · encaminhado por{' '}
          {nomeDoUsuario(encaminhamento.profissionalId)} em {dataLonga(encaminhamento.data)}
        </p>
        {encerrado && (
          <p className="mt-2 text-[15px] font-medium">
            O acompanhamento na unidade foi encerrado em {dataLonga(ficha.acompanhamento.encerramento!.data)}.
          </p>
        )}
      </header>

      <figure className="rounded-xl border-l-4 border-primary bg-card py-4 pr-6 pl-5 ring-1 ring-border">
        <figcaption className="text-[13px] font-medium text-muted-foreground">Motivo do encaminhamento</figcaption>
        <blockquote className="mt-1 text-[17px] leading-relaxed">{encaminhamento.motivo}</blockquote>
      </figure>

      <CartaoAgora ficha={ficha} />

      <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-5">
        <section className="min-w-0 rounded-xl bg-card p-5 ring-1 ring-border">
          <h2 className="mb-3 text-[17px] font-semibold">Evolução</h2>
          <GraficoEvolucao
            respostas={ficha.respostas}
            lacunas={ficha.lacunas}
            inicio={ficha.acompanhamento.inicio}
            ate={ficha.acompanhamento.encerramento?.data ?? HOJE}
          />
        </section>
        <div className="flex flex-col gap-5">
          <CartaoLateral titulo="Encaminhamento">
            <dl className="flex flex-col gap-3">
              {(
                [
                  ['Prejuízo funcional', encaminhamento.prejuizoFuncional],
                  ['Tratamentos já feitos', encaminhamento.tratamentos],
                ] as const
              ).map(([rotulo, texto]) => (
                <div key={rotulo}>
                  <dt className="text-[13px] text-muted-foreground">{rotulo}</dt>
                  <dd>{texto}</dd>
                </div>
              ))}
            </dl>
          </CartaoLateral>
          <ContextoPaciente ficha={ficha} />
        </div>
      </div>
    </div>
  )
}
