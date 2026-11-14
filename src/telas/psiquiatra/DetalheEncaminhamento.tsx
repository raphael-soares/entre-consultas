import { ChevronLeft, FileX } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { CartaoAgora } from '@/componentes/CartaoAgora'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import { GraficoEvolucao } from '@/componentes/GraficoEvolucao'
import { ResumoGerado } from '@/componentes/ResumoGerado'
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

      <div className="grid grid-cols-[minmax(0,1fr)_380px] items-start gap-5">
        <div className="flex min-w-0 flex-col gap-5">
          <section className="flex flex-col gap-4 rounded-xl bg-card p-5 ring-1 ring-border">
            <h2 className="text-[17px] font-semibold">Encaminhamento</h2>
            {(
              [
                ['Motivo', encaminhamento.motivo],
                ['Prejuízo funcional', encaminhamento.prejuizoFuncional],
                ['Tratamentos já feitos', encaminhamento.tratamentos],
              ] as const
            ).map(([rotulo, texto]) => (
              <div key={rotulo}>
                <p className="text-[13px] text-muted-foreground">{rotulo}</p>
                <p className="mt-0.5 text-[15px]">{texto}</p>
              </div>
            ))}
          </section>
          <CartaoAgora ultima={ficha.ultima} tratamento={ficha.tratamento} />
          <section className="rounded-xl bg-card p-5 ring-1 ring-border">
            <h2 className="mb-3 text-[17px] font-semibold">Evolução</h2>
            <GraficoEvolucao
              respostas={ficha.respostas}
              lacunas={ficha.lacunas}
              inicio={ficha.acompanhamento.inicio}
              ate={ficha.acompanhamento.encerramento?.data ?? HOJE}
            />
          </section>
        </div>
        <section className="rounded-xl bg-card p-5 ring-1 ring-border">
          <h2 className="text-[17px] font-semibold">Resumo na data do encaminhamento</h2>
          <p className="mt-1 mb-5 text-[13px] text-muted-foreground">Gerado pelo sistema em {dataLonga(encaminhamento.data)}.</p>
          <ResumoGerado resumo={encaminhamento.resumo} />
        </section>
      </div>
    </div>
  )
}
