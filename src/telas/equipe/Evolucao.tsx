import { ArrowRightLeft, ClipboardPen, Ellipsis, Send, TriangleAlert, UserX } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router'
import { CartaoAgora } from '@/componentes/CartaoAgora'
import { CartaoLateral, ContextoPaciente } from '@/componentes/ContextoPaciente'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import { GraficoEvolucao } from '@/componentes/GraficoEvolucao'
import { Button } from '@/componentes/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/componentes/ui/dropdown-menu'
import { nomeDoUsuario } from '@/dados/fixtures'
import { HOJE, dataCurta, dataLonga, idade } from '@/dominio/hoje'
import { OPCOES } from '@/dominio/phq9'
import { MOTIVOS_TRANSFERENCIA } from '@/dominio/rotulos'
import { useFicha, type Ficha } from '@/estado/consultas'
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
  return (
    <div className="flex flex-col gap-4 px-8 pt-5 pb-16">
      <header className="flex flex-col gap-3">
        <div>
          <h1 className="text-[28px] leading-tight font-bold tracking-tight">{cadastro.nome}</h1>
          <p className="text-[13px] text-muted-foreground">
            {idade(cadastro.nascimento, HOJE)} anos · Responsável: {nomeDoUsuario(acompanhamento.responsavelId)}
          </p>
          <p className="mt-2 text-[14px]">
            Desde {dataLonga(acompanhamento.inicio)}, a cada {acompanhamento.periodicidade} dias. Próximo questionário
            em <strong>{dataLonga(ficha.prevista)}</strong>.
          </p>
          <p className="text-[12px] text-muted-foreground">
            {ficha.lembretes.length
              ? `Lembrete no WhatsApp em ${ficha.lembretes.map(dataCurta).join(' e ')}`
              : 'Sem celular no cadastro, sem lembrete'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="registrar">
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
              <Link to="encaminhar">
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

      <Avisos ficha={ficha} />

      <CartaoAgora ficha={ficha} />

      <div className="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-4">
        <section className="min-w-0 rounded-xl bg-card px-5 py-4 ring-1 ring-border">
          <h2 className="mb-2 text-[15px] font-semibold">Evolução</h2>
          {ficha.respostas.length ? (
            <GraficoEvolucao
              respostas={ficha.respostas}
              lacunas={ficha.lacunas}
              inicio={acompanhamento.inicio}
              ate={HOJE}
            />
          ) : (
            <p className="py-10 text-center text-muted-foreground">O gráfico aparece depois da primeira resposta.</p>
          )}
        </section>
        <div className="flex flex-col gap-4">
          <ContextoPaciente ficha={ficha} />
          <Historico ficha={ficha} />
        </div>
      </div>

      <DialogoEncerrar aberto={dialogo === 'encerrar'} fechar={fecharDialogo} ficha={ficha} />
      <DialogoTransferir aberto={dialogo === 'transferir'} fechar={fecharDialogo} ficha={ficha} />
    </div>
  )
}

function Avisos({ ficha }: { ficha: Ficha }) {
  const { ultima, destaques, encaminhamento, cadastro } = ficha
  return (
    <>
      {destaques.includes('risco') && ultima && (
        <div role="alert" className="flex items-start gap-3 rounded-xl bg-risco px-5 py-3 text-white">
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p className="text-[14px]">
            <strong>Risco.</strong> Na resposta de {dataLonga(ultima.data)}, disse que pensou em se ferir em "
            {OPCOES[ultima.itens[8]].toLowerCase()}" nas últimas duas semanas. Entre em contato com{' '}
            {cadastro.nome.split(' ')[0]} o quanto antes.
          </p>
        </div>
      )}
      {destaques.includes('sugere-encaminhamento') && (
        <div className="flex items-center justify-between gap-4 rounded-xl bg-accent px-5 py-3 text-accent-foreground">
          <p className="text-[14px]">
            <strong>Sugere encaminhamento.</strong> Depois de 16 semanas a pontuação não caiu 5 pontos, ou os
            pensamentos de se ferir aparecem há 12 semanas. Quem decide é você.
          </p>
          <Button asChild size="sm">
            <Link to="encaminhar">Encaminhar</Link>
          </Button>
        </div>
      )}
      {encaminhamento && (
        <div className="flex items-center gap-3 rounded-xl bg-card px-5 py-3 text-[14px] ring-1 ring-border">
          <Send className="size-5 text-primary" aria-hidden />
          Encaminhado a {nomeDoUsuario(encaminhamento.psiquiatraId)} em {dataLonga(encaminhamento.data)}.
        </div>
      )}
    </>
  )
}

function Historico({ ficha }: { ficha: Ficha }) {
  const { acompanhamento, encaminhamento, transferencias, respostas } = ficha
  const registradas = respostas.filter((r) => r.registradoPor)
  return (
    <CartaoLateral titulo="Histórico">
      <ul className="flex flex-col gap-2.5">
        <li>
          <p>Acompanhamento aberto</p>
          <p className="text-[12px] text-muted-foreground">{dataLonga(acompanhamento.inicio)}</p>
        </li>
        {registradas.length > 0 && (
          <li>
            <p>
              {registradas.length} {registradas.length === 1 ? 'resposta registrada' : 'respostas registradas'} pela equipe
            </p>
            <p className="text-[12px] text-muted-foreground">
              Última por {nomeDoUsuario(registradas.at(-1)!.registradoPor!)}
            </p>
          </li>
        )}
        {encaminhamento && (
          <li>
            <p>Encaminhado a {nomeDoUsuario(encaminhamento.psiquiatraId)}</p>
            <p className="text-[12px] text-muted-foreground">
              {dataLonga(encaminhamento.data)}, por {nomeDoUsuario(encaminhamento.profissionalId)}
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
              {dataLonga(t.data)}, por {nomeDoUsuario(t.porId)}. Motivo: {MOTIVOS_TRANSFERENCIA[t.motivo].toLowerCase()}
              {t.detalhe ? ` (${t.detalhe})` : ''}
            </p>
          </li>
        ))}
      </ul>
    </CartaoLateral>
  )
}
