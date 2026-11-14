import { ChevronRight, Inbox, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import { UNIDADE, nomeDoUsuario } from '@/dados/fixtures'
import { TEXTO_RESPOSTA_TRATAMENTO, textoVariacao } from '@/dominio/evolucao'
import { HOJE, dataCurta, diasEntre, idade } from '@/dominio/hoje'
import { faixa, pontuacao } from '@/dominio/phq9'
import { lerPergunta9 } from '@/dominio/resumo'
import { useEncaminhamentosDe, type CasoEncaminhado } from '@/estado/consultas'
import { useUsuarioLogado } from '@/estado/store'
import { cn } from '@/lib/utils'

const COLUNAS = ['Paciente', 'Agora', 'Pensamentos de se ferir', 'Resposta ao tratamento', 'Motivo', 'Encaminhado']

function haQuanto(data: string): string {
  const dias = diasEntre(data, HOJE)
  if (dias === 0) return 'Hoje'
  if (dias === 1) return 'Ontem'
  return `Há ${dias} dias`
}

const Legenda = ({ children }: { children: ReactNode }) => (
  <p className="text-[12px] leading-snug text-muted-foreground">{children}</p>
)

export function ListaEncaminhamentos() {
  const usuario = useUsuarioLogado()!
  const casos = useEncaminhamentosDe(usuario.id)
  const comPensamentos = casos.filter((c) => (c.ficha.ultima?.itens[8] ?? 0) > 0).length

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[28px] leading-tight font-bold tracking-tight">Encaminhamentos recebidos</h1>
        <p className="text-[13px] text-muted-foreground">
          {casos.length} {casos.length === 1 ? 'paciente' : 'pacientes'}
          {comPensamentos > 0 &&
            `, ${comPensamentos} com pensamentos de se ferir na última resposta`}
          . Na ordem de prioridade: pensamentos de se ferir na última resposta, depois a pontuação mais alta.
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
        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-border">
          <table className="w-full table-fixed text-left">
            <colgroup>
              <col className="w-[210px]" />
              <col className="w-[130px]" />
              <col className="w-[190px]" />
              <col className="w-[170px]" />
              <col />
              <col className="w-[150px]" />
              <col className="w-10" />
            </colgroup>
            <thead className="border-b text-[12px] text-muted-foreground">
              <tr>
                {COLUNAS.map((c) => (
                  <th key={c} scope="col" className="px-3 py-2 font-medium first:pl-5">
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
      )}
    </div>
  )
}

function Linha({ caso }: { caso: CasoEncaminhado }) {
  const navigate = useNavigate()
  const { encaminhamento, ficha } = caso
  const { cadastro, ultima, tratamento, respostas } = ficha
  const total = ultima ? pontuacao(ultima.itens) : null
  const f = total !== null ? faixa(total) : null
  const pergunta9 = lerPergunta9(respostas.map((r) => ({ data: r.data, valor: r.itens[8] })))
  const destino = `/psiquiatra/encaminhamentos/${encaminhamento.id}`

  return (
    <tr
      onClick={(e) => (e.target as HTMLElement).closest('a') || navigate(destino)}
      className="cursor-pointer align-top transition-colors hover:bg-background"
    >
      <td className="py-3 pr-3 pl-5">
        <Link to={destino} className="text-[15px] leading-snug font-semibold hover:underline">
          {cadastro.nome}
        </Link>
        <Legenda>
          {idade(cadastro.nascimento, HOJE)} anos · {UNIDADE}
        </Legenda>
        {ficha.acompanhamento.encerramento && <Legenda>Acompanhamento encerrado na unidade</Legenda>}
      </td>
      <td className="px-3 py-3">
        {total !== null && f ? (
          <>
            <p className="text-[20px] leading-tight font-bold tabular-nums">{total}</p>
            <p className="text-[13px] leading-snug font-semibold" style={{ color: f.cor }}>
              {f.nome}
            </p>
            <Legenda>em {dataCurta(ultima!.data)}</Legenda>
          </>
        ) : (
          <p className="text-[14px] text-muted-foreground">Sem respostas</p>
        )}
      </td>
      <td className="px-3 py-3">
        <p className={cn('flex items-start gap-1 text-[14px] leading-snug font-semibold', pergunta9.positiva && 'text-risco')}>
          {pergunta9.positiva && <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />}
          {pergunta9.titulo}
        </p>
        {pergunta9.detalhe && <Legenda>{pergunta9.detalhe}</Legenda>}
      </td>
      <td className="px-3 py-3">
        <p className="text-[14px] leading-snug">{TEXTO_RESPOSTA_TRATAMENTO[tratamento.tipo]}</p>
        {tratamento.inicial !== null && tratamento.atual !== null && respostas.length > 1 && (
          <Legenda>{textoVariacao(tratamento.inicial, tratamento.atual)}</Legenda>
        )}
      </td>
      <td className="px-3 py-3">
        <p className="line-clamp-3 text-[13px] leading-snug">{encaminhamento.motivo}</p>
      </td>
      <td className="px-3 py-3">
        <p className="text-[14px] leading-snug">{haQuanto(encaminhamento.data)}</p>
        <Legenda>por {nomeDoUsuario(encaminhamento.profissionalId)}</Legenda>
      </td>
      <td className="py-3 pr-3 align-middle">
        <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
      </td>
    </tr>
  )
}
