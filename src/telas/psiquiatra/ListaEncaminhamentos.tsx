import { ChevronRight, Inbox, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { BadgeFaixa } from '@/componentes/BadgeFaixa'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import { UNIDADE } from '@/dados/fixtures'
import { NOMES_SITUACAO, situacaoEncaminhamento } from '@/dominio/encaminhamento'
import { HOJE, dataRelativa, idade } from '@/dominio/hoje'
import { pontuacao } from '@/dominio/phq9'
import { useEncaminhamentosDe, type CasoEncaminhado } from '@/estado/consultas'
import { useUsuarioLogado } from '@/estado/store'
import { cn } from '@/lib/utils'

const COLUNAS = ['Paciente', 'Situação', 'Agora', 'Motivo', 'Encaminhado']

const Legenda = ({ children }: { children: ReactNode }) => (
  <p className="text-[12px] leading-snug text-muted-foreground">{children}</p>
)

export function ListaEncaminhamentos() {
  const usuario = useUsuarioLogado()!
  const casos = useEncaminhamentosDe(usuario.id)
  const comPensamentos = casos.filter((c) => (c.ficha.ultima?.itens[8] ?? 0) > 0).length
  const abertos = casos.filter((c) => situacaoEncaminhamento(c.encaminhamento) !== 'respondido')
  const respondidos = casos.filter((c) => situacaoEncaminhamento(c.encaminhamento) === 'respondido')

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[28px] leading-tight font-bold tracking-tight">Encaminhamentos recebidos</h1>
        <p className="text-[13px] text-muted-foreground">
          {UNIDADE} · {casos.length} {casos.length === 1 ? 'paciente' : 'pacientes'}
          {comPensamentos > 0 && `, ${comPensamentos} com pensamentos de se ferir na última resposta`}. Em ordem de
          prioridade.
        </p>
      </div>
      {casos.length === 0 ? (
        <EstadoVazio
          icone={Inbox}
          titulo="Nenhum encaminhamento por enquanto"
          texto="Quando uma equipe encaminhar um paciente para você, ele aparece aqui com o histórico do acompanhamento."
          className="rounded-xl bg-card py-16 ring-1 ring-border"
        />
      ) : (
        <>
          {abertos.length > 0 && <Tabela titulo="Para atender" casos={abertos} />}
          {respondidos.length > 0 && <Tabela titulo="Respondidos" casos={respondidos} />}
        </>
      )}
    </div>
  )
}

function Tabela({ titulo, casos }: { titulo: string; casos: CasoEncaminhado[] }) {
  return (
    <section aria-label={titulo} className="flex flex-col gap-1.5">
      <h2 className="px-1 text-[13px] font-semibold text-muted-foreground">
        {titulo} <span className="font-normal tabular-nums">({casos.length})</span>
      </h2>
      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-border">
        <table className="w-full table-fixed text-left">
          <colgroup>
            <col className="w-[240px]" />
            <col className="w-[160px]" />
            <col className="w-[190px]" />
            <col />
            <col className="w-[120px]" />
            <col className="w-10" />
          </colgroup>
          <thead className="border-b text-[12px] text-muted-foreground">
            <tr>
              {COLUNAS.map((c) => (
                <th key={c} scope="col" className="px-3 py-1.5 font-medium first:pl-5">
                  {c}
                </th>
              ))}
              <th scope="col">
                <span className="sr-only">Abrir</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {casos.map((caso) => (
              <Linha key={caso.encaminhamento.id} caso={caso} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Linha({ caso }: { caso: CasoEncaminhado }) {
  const navigate = useNavigate()
  const { encaminhamento, ficha } = caso
  const { cadastro, ultima } = ficha
  const total = ultima ? pontuacao(ultima.itens) : null
  const pensouEmSeFerir = (ultima?.itens[8] ?? 0) > 0
  const destino = `/psiquiatra/encaminhamentos/${encaminhamento.id}`
  const novo = situacaoEncaminhamento(encaminhamento) === 'novo'

  return (
    <tr
      onClick={(e) => (e.target as HTMLElement).closest('a') || navigate(destino)}
      className="cursor-pointer align-top transition-colors hover:bg-background"
    >
      <td className="py-2.5 pr-3 pl-5">
        <div className="flex items-start gap-2">
          <span className="mt-[7px] flex size-2 shrink-0" aria-hidden={!novo}>
            {novo && (
              <>
                <span className="size-2 rounded-full bg-primary" aria-hidden />
                <span className="sr-only">Novo</span>
              </>
            )}
          </span>
          <div>
            <Link
              to={destino}
              className={cn('text-[15px] leading-snug hover:underline', novo ? 'font-bold' : 'font-normal')}
            >
              {cadastro.nome}
            </Link>
            <Legenda>
              {idade(cadastro.nascimento, HOJE)} anos
              {ficha.acompanhamento.encerramento && ' · encerrado na unidade'}
            </Legenda>
            {pensouEmSeFerir && (
              <p className="flex items-center gap-1 text-[12px] leading-snug font-semibold text-risco">
                <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
                Pensou em se ferir
              </p>
            )}
          </div>
        </div>
      </td>
      <td className={cn('px-3 py-2.5 text-[14px] leading-snug', novo ? 'font-semibold text-primary' : 'text-muted-foreground')}>
        {NOMES_SITUACAO[situacaoEncaminhamento(caso.encaminhamento)]}
      </td>
      <td className="px-3 py-2.5">
        {total !== null ? (
          <>
            <p className="flex items-baseline gap-2 text-[14px] leading-snug whitespace-nowrap">
              <span className="text-[17px] leading-tight font-bold tabular-nums">{total}</span>
              <BadgeFaixa pontuacao={total} curta className="text-[13px]" />
            </p>
            <Legenda>{dataRelativa(ultima!.data)}</Legenda>
          </>
        ) : (
          <p className="text-[14px] text-muted-foreground">Sem respostas</p>
        )}
      </td>
      <td className="px-3 py-2.5">
        <p className="line-clamp-2 text-[13px] leading-snug">{encaminhamento.motivo}</p>
      </td>
      <td className="px-3 py-2.5 text-[14px] leading-snug">{dataRelativa(encaminhamento.data)}</td>
      <td className="py-2.5 pr-3 align-middle">
        <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
      </td>
    </tr>
  )
}
