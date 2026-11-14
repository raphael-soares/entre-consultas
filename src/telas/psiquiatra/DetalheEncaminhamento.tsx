import { CalendarPlus, ChevronLeft, FileX, Pencil, Reply } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { CartaoAgora } from '@/componentes/CartaoAgora'
import { ContextoSocial } from '@/componentes/ContextoPaciente'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import { PainelEvolucao } from '@/componentes/PainelEvolucao'
import { Button } from '@/componentes/ui/button'
import { CADASTROS, UNIDADE, nomeDoUsuario } from '@/dados/fixtures'
import { situacaoEncaminhamento } from '@/dominio/encaminhamento'
import { HOJE, dataLonga, dataPorExtenso, idade } from '@/dominio/hoje'
import type { Encaminhamento } from '@/dominio/tipos'
import { fichaDoEncaminhamento, useDados } from '@/estado/consultas'
import { useStore, useUsuarioLogado } from '@/estado/store'
import { CartaoContrarreferencia, PainelContrarreferencia } from './PainelContrarreferencia'
import { PainelConsulta } from './PainelConsulta'

const VOLTAR = (
  <Button asChild variant="ghost" className="self-start px-2">
    <Link to="/psiquiatra">
      <ChevronLeft aria-hidden />
      Encaminhamentos recebidos
    </Link>
  </Button>
)

function textoSituacao(e: Encaminhamento): string {
  switch (situacaoEncaminhamento(e)) {
    case 'novo':
      return 'Novo, ainda sem consulta marcada'
    case 'visto':
      return 'Visto, ainda sem consulta marcada'
    case 'consulta-marcada':
      return `Consulta marcada para ${dataPorExtenso(e.consulta!.data).toLowerCase()}`
    case 'respondido':
      return `Respondido em ${dataLonga(e.contrarreferencia!.data)}`
  }
}

export function DetalheEncaminhamento() {
  const { id } = useParams()
  const usuario = useUsuarioLogado()!
  const dados = useDados()
  const marcarVisto = useStore((s) => s.marcarVisto)
  const [params, setParams] = useSearchParams()
  const painel = params.get('painel')
  const abrirPainel = (nome: 'consulta' | 'responder') =>
    setParams((atual) => {
      const proximo = new URLSearchParams(atual)
      proximo.set('painel', nome)
      return proximo
    })
  const fecharPainel = () =>
    setParams(
      (atual) => {
        const proximo = new URLSearchParams(atual)
        proximo.delete('painel')
        return proximo
      },
      { replace: true },
    )
  const encaminhamento = dados.encaminhamentos.find((e) => e.id === id && e.psiquiatraId === usuario.id)
  const encontrado = !!encaminhamento

  useEffect(() => {
    if (encontrado && id) marcarVisto(id)
  }, [encontrado, id, marcarVisto])

  const ficha = useMemo(() => (encaminhamento ? fichaDoEncaminhamento(dados, encaminhamento) : null), [dados, encaminhamento])

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
  const respondido = !!encaminhamento.contrarreferencia

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-start gap-1">
        <Button asChild variant="ghost" size="icon" className="-ml-3">
          <Link to="/psiquiatra" aria-label="Voltar para encaminhamentos recebidos">
            <ChevronLeft className="size-6" aria-hidden />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-[28px] leading-tight font-bold tracking-tight">{cadastro.nome}</h1>
          <p className="text-[13px] text-muted-foreground">
            {idade(cadastro.nascimento, HOJE)} anos · {UNIDADE} · encaminhado por{' '}
            {nomeDoUsuario(encaminhamento.profissionalId)} em {dataLonga(encaminhamento.data)}
          </p>
          <p className="mt-1 text-[14px] font-medium">{textoSituacao(encaminhamento)}</p>
          {encerrado && (
            <p className="mt-1 text-[13px] font-medium">
              O acompanhamento na unidade foi encerrado em {dataLonga(ficha.acompanhamento.encerramento!.data)}.
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {respondido ? (
            <Button variant="outline" onClick={() => abrirPainel('responder')}>
              <Pencil aria-hidden />
              Editar resposta
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => abrirPainel('consulta')}>
                <CalendarPlus aria-hidden />
                {encaminhamento.consulta ? 'Remarcar consulta' : 'Marcar consulta'}
              </Button>
              <Button onClick={() => abrirPainel('responder')}>
                <Reply aria-hidden />
                Responder à unidade
              </Button>
            </>
          )}
        </div>
      </header>

      {encaminhamento.contrarreferencia && <CartaoContrarreferencia contrarreferencia={encaminhamento.contrarreferencia} />}

      <section aria-label="Encaminhamento" className="rounded-xl bg-card px-5 py-4 ring-1 ring-border">
        <dl className="grid grid-cols-3 gap-6 text-[14px] leading-snug">
          {(
            [
              ['Motivo do encaminhamento', encaminhamento.motivo],
              ['Prejuízo funcional', encaminhamento.prejuizoFuncional],
              ['Tratamentos já feitos', encaminhamento.tratamentos],
            ] as const
          ).map(([rotulo, texto]) => (
            <div key={rotulo} className="flex flex-col gap-0.5">
              <dt className="text-[12px] font-medium text-muted-foreground">{rotulo}</dt>
              <dd>{texto}</dd>
            </div>
          ))}
        </dl>
      </section>

      <CartaoAgora ficha={ficha} />

      <PainelEvolucao
        ficha={ficha}
        ate={ficha.acompanhamento.encerramento?.data ?? HOJE}
        lateral={<ContextoSocial cadastro={ficha.cadastro} emLinha />}
        inspetor
      />

      {painel === 'consulta' && !respondido && (
        <PainelConsulta
          fechar={fecharPainel}
          encaminhamentoId={encaminhamento.id}
          paciente={cadastro.nome}
          dataAtual={encaminhamento.consulta?.data}
        />
      )}
      {painel === 'responder' && (
        <PainelContrarreferencia
          fechar={fecharPainel}
          encaminhamentoId={encaminhamento.id}
          paciente={cadastro.nome}
          atual={encaminhamento.contrarreferencia}
        />
      )}
    </div>
  )
}
