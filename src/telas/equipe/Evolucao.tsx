import { ArrowRightLeft, ClipboardPen, Ellipsis, Send, TriangleAlert, UserX } from 'lucide-react'
import { Link, Outlet, useParams, useSearchParams } from 'react-router'
import { CartaoAgora } from '@/componentes/CartaoAgora'
import { CartaoEncaminhamento } from '@/componentes/CartaoEncaminhamento'
import { CartaoLateral, ContextoPaciente } from '@/componentes/ContextoPaciente'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import { PainelEvolucao } from '@/componentes/PainelEvolucao'
import { Button } from '@/componentes/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/componentes/ui/dropdown-menu'
import { nomeDoUsuario } from '@/dados/fixtures'
import { HOJE, dataPorExtenso, dataRelativa, idade } from '@/dominio/hoje'
import { OPCOES } from '@/dominio/phq9'
import { MOTIVOS_TRANSFERENCIA } from '@/dominio/rotulos'
import { useFicha, type Ficha } from '@/estado/consultas'
import { fraseTendencia } from '@/lib/tendencia'
import { DialogoEncerrar } from './DialogoEncerrar'
import { DialogoTransferir } from './DialogoTransferir'

export function Evolucao() {
  const { id } = useParams()
  const ficha = useFicha(id)
  const [params, setParams] = useSearchParams()
  const dialogo = params.get('dialogo')
  const fecharDialogo = () => setParams({}, { replace: true })

  if (!ficha) {
    return (
      <EstadoVazio
        icone={UserX}
        titulo="Este paciente não está em acompanhamento"
        texto="O acompanhamento pode ter sido encerrado. Para voltar a acompanhar, abra um novo."
        acao={
          <Button asChild variant="outline">
            <Link to="/equipe/abrir">Abrir acompanhamento</Link>
          </Button>
        }
        className="h-full"
      />
    )
  }

  const { cadastro, acompanhamento, encaminhamento } = ficha
  const base = `/equipe/pacientes/${cadastro.id}`
  return (
    <div className="flex flex-col gap-4 px-8 pt-5 pb-16">
      <header className="flex flex-col gap-3">
        <div>
          <h1 className="text-[28px] leading-tight font-bold tracking-tight">{cadastro.nome}</h1>
          <p className="text-[13px] text-muted-foreground">
            {idade(cadastro.nascimento, HOJE)} anos · Responsável: {nomeDoUsuario(acompanhamento.responsavelId)}
          </p>
          <p className="mt-2 text-[15px]">{fraseTendencia(ficha)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to={`${base}/registrar`}>
              <ClipboardPen aria-hidden />
              Registrar respostas
            </Link>
          </Button>
          {encaminhamento ? (
            <Button variant="outline" disabled>
              <Send aria-hidden />
              Já encaminhado
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link to={`${base}/encaminhar`}>
                <Send aria-hidden />
                Encaminhar ao especialista
              </Link>
            </Button>
          )}
          <Button variant="outline" onClick={() => setParams({ dialogo: 'transferir' })}>
            <ArrowRightLeft aria-hidden />
            Transferir
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Mais ações">
                <Ellipsis aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                variant="destructive"
                className="min-h-11 px-3 text-[15px]"
                onSelect={() => setParams({ dialogo: 'encerrar' })}
              >
                <UserX aria-hidden />
                Encerrar acompanhamento
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Avisos ficha={ficha} base={base} />

      <CartaoAgora ficha={ficha} />

      <PainelEvolucao
        ficha={ficha}
        ate={HOJE}
        lateral={
          <>
            {encaminhamento && <CartaoEncaminhamento encaminhamento={encaminhamento} />}
            <CartaoAcompanhamento ficha={ficha} />
            <ContextoPaciente ficha={ficha} />
          </>
        }
      />

      <DialogoEncerrar aberto={dialogo === 'encerrar'} fechar={fecharDialogo} ficha={ficha} />
      <DialogoTransferir aberto={dialogo === 'transferir'} fechar={fecharDialogo} ficha={ficha} />
      <Outlet />
    </div>
  )
}

function Avisos({ ficha, base }: { ficha: Ficha; base: string }) {
  const { ultima, destaques, cadastro } = ficha
  return (
    <>
      {destaques.includes('risco') && ultima && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-risco/30 bg-risco/10 px-5 py-3.5"
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-risco" aria-hidden />
          <div className="text-[14px]">
            <p className="font-semibold text-risco">Risco</p>
            <p>
              Na resposta de {dataPorExtenso(ultima.data).toLowerCase()}, disse que pensou em se ferir em "
              {OPCOES[ultima.itens[8]].toLowerCase()}" nas últimas duas semanas. Entre em contato com{' '}
              {cadastro.nome.split(' ')[0]} o quanto antes.
            </p>
          </div>
        </div>
      )}
      {destaques.includes('sugere-encaminhamento') && (
        <div className="flex items-center justify-between gap-4 rounded-xl bg-accent px-5 py-3 text-accent-foreground">
          <p className="text-[14px]">
            <strong>Sugere encaminhamento.</strong> Depois de 16 semanas a pontuação não caiu 5 pontos, ou os
            pensamentos de se ferir aparecem há 12 semanas. Quem decide é você.
          </p>
          <Button asChild size="sm">
            <Link to={`${base}/encaminhar`}>Encaminhar</Link>
          </Button>
        </div>
      )}
    </>
  )
}

function CartaoAcompanhamento({ ficha }: { ficha: Ficha }) {
  const { acompanhamento, transferencias, respostas, prevista, lembretes } = ficha
  const registradas = respostas.filter((r) => r.registradoPor)
  return (
    <CartaoLateral titulo="Acompanhamento">
      <dl className="flex flex-col gap-2">
        <div>
          <dt className="text-[12px] text-muted-foreground">Periodicidade</dt>
          <dd>A cada {acompanhamento.periodicidade} dias</dd>
        </div>
        <div>
          <dt className="text-[12px] text-muted-foreground">Próximo questionário</dt>
          <dd>{dataPorExtenso(prevista)}</dd>
        </div>
        <div>
          <dt className="text-[12px] text-muted-foreground">Lembretes</dt>
          <dd>
            {lembretes.length
              ? `No WhatsApp: ${lembretes.map((d) => dataRelativa(d)).join(' e ')}`
              : 'Sem celular no cadastro, sem lembrete'}
          </dd>
        </div>
      </dl>

      <h3 className="mt-3.5 mb-2 border-t pt-3.5 text-[12px] font-medium text-muted-foreground">Histórico</h3>
      <ul className="flex flex-col gap-2.5">
        <li>
          <p>Acompanhamento aberto</p>
          <p className="text-[12px] text-muted-foreground">{dataRelativa(acompanhamento.inicio)}</p>
        </li>
        {registradas.length > 0 && (
          <li>
            <p>
              {registradas.length} {registradas.length === 1 ? 'resposta registrada' : 'respostas registradas'} pela
              equipe
            </p>
            <p className="text-[12px] text-muted-foreground">
              Última por {nomeDoUsuario(registradas.at(-1)!.registradoPor!)}
            </p>
          </li>
        )}
        {transferencias.map((t) => (
          <li key={t.id}>
            <p>
              {t.tipo === 'acompanhamento' ? 'Acompanhamento transferido' : 'Encaminhamento redirecionado'} de{' '}
              {nomeDoUsuario(t.deId)} para {nomeDoUsuario(t.paraId)}
            </p>
            <p className="text-[12px] text-muted-foreground">
              {dataRelativa(t.data)}, por {nomeDoUsuario(t.porId)}. Motivo:{' '}
              {MOTIVOS_TRANSFERENCIA[t.motivo].toLowerCase()}
              {t.detalhe ? ` (${t.detalhe})` : ''}
            </p>
          </li>
        ))}
      </ul>
    </CartaoLateral>
  )
}
