import { ChevronLeft, FileX } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { CartaoAgora } from '@/componentes/CartaoAgora'
import { ContextoSocial } from '@/componentes/ContextoPaciente'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import { PainelEvolucao } from '@/componentes/PainelEvolucao'
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
    <div className="flex flex-col gap-4">
      <header className="flex items-start gap-1">
        <Button asChild variant="ghost" size="icon" className="-ml-3">
          <Link to="/psiquiatra" aria-label="Voltar para encaminhamentos recebidos">
            <ChevronLeft className="size-6" aria-hidden />
          </Link>
        </Button>
        <div>
          <h1 className="text-[28px] leading-tight font-bold tracking-tight">{cadastro.nome}</h1>
          <p className="text-[13px] text-muted-foreground">
            {idade(cadastro.nascimento, HOJE)} anos · {UNIDADE} · encaminhado por{' '}
            {nomeDoUsuario(encaminhamento.profissionalId)} em {dataLonga(encaminhamento.data)}
          </p>
          {encerrado && (
            <p className="mt-1 text-[13px] font-medium">
              O acompanhamento na unidade foi encerrado em {dataLonga(ficha.acompanhamento.encerramento!.data)}.
            </p>
          )}
        </div>
      </header>

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
    </div>
  )
}
