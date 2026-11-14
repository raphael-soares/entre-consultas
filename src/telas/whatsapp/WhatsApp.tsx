import { ArrowLeft, Check, CheckCheck, HeartHandshake, List, Phone, RotateCcw, SendHorizontal, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'
import { MolduraCelular } from '@/componentes/MolduraCelular'
import { Button } from '@/componentes/ui/button'
import { ACOMPANHAMENTOS, CADASTROS, EQUIPE, UNIDADE } from '@/dados/fixtures'
import { lembretes } from '@/dominio/agenda'
import { HOJE } from '@/dominio/hoje'
import { ESTRESSORES, OPCOES } from '@/dominio/phq9'
import type { Estressor } from '@/dominio/tipos'
import { primeiraEmBranco, rascunhoDeExemplo, rascunhoVazio } from '@/estado/rascunho'
import { useStore, type Rascunho } from '@/estado/store'
import { cn } from '@/lib/utils'
import {
  BOTOES_ALERTA,
  BOTOES_LEMBRETE,
  BOTOES_MAIS,
  PERGUNTA_ESTRESSORES,
  montarConversa,
  textosLembrete,
  type Mensagem,
  type Passo,
} from './conversa'

const PACIENTE = 'ana'
const NENHUMA = 'nenhuma'
const cadastro = CADASTROS.find((c) => c.id === PACIENTE)!
const primeiroNome = cadastro.nome.split(' ')[0]

function exemploPara(passo: Passo): Rascunho {
  if (passo.startsWith('pergunta-')) return rascunhoDeExemplo(Number(passo.slice(9)) - 1)
  if (passo === 'alerta') return rascunhoDeExemplo(9, 1)
  if (passo === 'mais') return rascunhoDeExemplo(9, 0, ['trabalho'])
  if (passo === 'outro') return rascunhoDeExemplo(9, 0, ['outro'])
  if (passo === 'fim') return rascunhoDeExemplo(9, 0, ['dinheiro'])
  return rascunhoDeExemplo(9)
}

// Passo fora do lugar (link antigo, recarga) volta para o primeiro ponto que falta responder.
function passoValido(passo: Passo, rascunho: Rascunho): Passo {
  if (passo === 'lembrete') return passo
  const emBranco = primeiraEmBranco(rascunho)
  const numero = passo.startsWith('pergunta-') ? Number(passo.slice(9)) : 10
  if (emBranco !== -1 && emBranco < numero - 1) return `pergunta-${emBranco + 1}`
  if (passo === 'alerta' && rascunho.itens[8] === 0) return 'estressores'
  return passo
}

function useLembretesDaAna() {
  const respostas = useStore((s) => s.respostas)
  const acompanhamento = useStore((s) => s.acompanhamentos.find((a) => a.pacienteId === PACIENTE))
  const anteriores = respostas.filter((r) => r.pacienteId === PACIENTE && r.data < HOJE)
  const datas = lembretes(cadastro, acompanhamento ?? ACOMPANHAMENTOS.find((a) => a.pacienteId === PACIENTE)!, anteriores)
  const textos = textosLembrete(primeiroNome, EQUIPE, UNIDADE)
  return datas.map((data, i) => ({ data, texto: textos[i] }))
}

export function WhatsApp() {
  const [params, setParams] = useSearchParams()
  const passo = (params.get('passo') ?? 'lembrete') as Passo
  const listaAberta = params.get('lista') === 'aberta'
  const rascunho = useStore((s) => s.rascunhos.whatsapp)
  const definirRascunho = useStore((s) => s.definirRascunho)
  const responder = useStore((s) => s.responder)
  const navigate = useNavigate()
  const lembretesDaAna = useLembretesDaAna()
  const [textoOutro, setTextoOutro] = useState('')
  const rolagem = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!rascunho && passo !== 'lembrete') definirRascunho('whatsapp', exemploPara(passo))
  }, [rascunho, passo, definirRascunho])

  const mensagens = montarConversa(rascunho, passo, lembretesDaAna, primeiroNome)

  useLayoutEffect(() => {
    rolagem.current?.scrollTo({ top: rolagem.current.scrollHeight })
  }, [mensagens.length, passo])

  if (rascunho && passo !== 'lembrete') {
    const valido = passoValido(passo, rascunho)
    if (valido !== passo) return <Navigate to={`?passo=${valido}`} replace />
  }

  const irPara = (proximo: Passo, lista = false) =>
    setParams(lista ? { passo: proximo, lista: 'aberta' } : { passo: proximo }, { replace: true })

  function enviar(final: Rascunho) {
    const outro = final.estressores.includes('outro') ? final.outroEstressor?.trim() : undefined
    responder(PACIENTE, 'whatsapp', {
      itens: final.itens as number[],
      estressores: final.estressores,
      ...(outro ? { outroEstressor: outro } : {}),
    })
    definirRascunho('whatsapp', final)
    irPara('fim')
  }

  function tocarBotao(rotulo: string) {
    if (rotulo === BOTOES_LEMBRETE[0]) {
      definirRascunho('whatsapp', rascunhoVazio())
      irPara('pergunta-1')
    } else if (rotulo === BOTOES_LEMBRETE[1]) navigate('/login')
    else if (rotulo === BOTOES_ALERTA[1]) irPara('estressores')
    else if (rotulo === BOTOES_MAIS[0]) irPara('estressores')
    else if (rotulo === BOTOES_MAIS[1] && rascunho) enviar(rascunho)
  }

  function escolherNaLista(valor: string) {
    if (!rascunho) return
    if (passo.startsWith('pergunta-')) {
      const numero = Number(passo.slice(9))
      const resposta = Number(valor)
      definirRascunho('whatsapp', { ...rascunho, itens: rascunho.itens.map((v, i) => (i === numero - 1 ? resposta : v)) })
      irPara(numero < 9 ? `pergunta-${numero + 1}` : resposta > 0 ? 'alerta' : 'estressores')
      return
    }
    if (valor === NENHUMA) {
      enviar(rascunho)
      return
    }
    const estressor = valor as Estressor
    definirRascunho('whatsapp', { ...rascunho, estressores: [...rascunho.estressores, estressor] })
    irPara(estressor === 'outro' ? 'outro' : 'mais')
  }

  function enviarOutro() {
    if (!rascunho || !textoOutro.trim()) return
    definirRascunho('whatsapp', { ...rascunho, outroEstressor: textoOutro.trim() })
    setTextoOutro('')
    irPara('mais')
  }

  const opcoesDaLista: { valor: string; rotulo: string }[] = passo.startsWith('pergunta-')
    ? OPCOES.map((rotulo, i) => ({ valor: String(i), rotulo }))
    : [
        ...ESTRESSORES.filter((e) => !rascunho?.estressores.includes(e.id)).map((e) => ({ valor: e.id, rotulo: e.nome })),
        ...(rascunho?.estressores.length ? [] : [{ valor: NENHUMA, rotulo: 'Nenhuma delas' }]),
      ]

  const reiniciar = () => {
    definirRascunho('whatsapp', undefined)
    irPara('lembrete')
  }

  return (
    <MolduraCelular
      estilo="whatsapp"
      legenda="WhatsApp da paciente Ana Beatriz, sem login"
      lado={
        <div className="flex flex-col gap-3 text-[15px] text-muted-foreground">
          <p>
            Conversa simulada. A paciente recebe o lembrete no dia previsto e responde as mesmas perguntas do site, uma
            por mensagem.
          </p>
          <Button variant="outline" onClick={reiniciar} className="self-start">
            <RotateCcw aria-hidden />
            Reiniciar conversa
          </Button>
        </div>
      }
    >
      <div className="relative flex min-h-0 flex-1 flex-col bg-whatsapp-fundo">
        <header className="flex items-center gap-3 bg-whatsapp-topo px-3 pt-1 pb-2.5 text-white">
          <ArrowLeft className="size-6" aria-hidden />
          <span className="grid size-10 place-items-center rounded-full bg-white">
            <HeartHandshake className="size-6 text-primary" aria-hidden />
          </span>
          <div className="leading-tight">
            <p className="text-[17px] font-semibold">Entre Consultas</p>
            <p className="text-[13px]">{UNIDADE}</p>
          </div>
        </header>

        <div ref={rolagem} className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-3" aria-live="polite">
          {mensagens.map((m, i) => (
            <Balao
              key={i}
              mensagem={m}
              ativa={i === mensagens.length - 1 && passo !== 'fim'}
              aoTocar={tocarBotao}
              aoAbrirLista={() => irPara(passo, true)}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 bg-[#f0f2f5] px-2 py-2">
          <input
            aria-label="Mensagem"
            disabled={passo !== 'outro'}
            value={textoOutro}
            onChange={(e) => setTextoOutro(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && enviarOutro()}
            placeholder={passo === 'outro' ? 'Escreva a situação' : 'Mensagem'}
            className="h-11 flex-1 rounded-full bg-white px-4 text-[15px] outline-none placeholder:text-[#54656f] disabled:opacity-100"
          />
          <button
            type="button"
            aria-label="Enviar mensagem"
            disabled={passo !== 'outro' || !textoOutro.trim()}
            onClick={enviarOutro}
            className="grid size-11 place-items-center rounded-full bg-whatsapp-topo text-white disabled:opacity-60"
          >
            <SendHorizontal className="size-5" aria-hidden />
          </button>
        </div>

        {listaAberta && rascunho && (
          <ListaWhatsApp
            titulo={passo.startsWith('pergunta-') ? 'Escolher resposta' : PERGUNTA_ESTRESSORES}
            opcoes={opcoesDaLista}
            fechar={() => irPara(passo)}
            escolher={escolherNaLista}
          />
        )}
      </div>
    </MolduraCelular>
  )
}

function Balao({
  mensagem,
  ativa,
  aoTocar,
  aoAbrirLista,
}: {
  mensagem: Mensagem
  ativa: boolean
  aoTocar: (rotulo: string) => void
  aoAbrirLista: () => void
}) {
  const daEquipe = mensagem.de === 'equipe'
  return (
    <>
      {mensagem.separador && (
        <p className="mx-auto my-2 rounded-lg bg-white px-3 py-1 text-[13px] font-medium text-[#54656f] shadow-sm">
          {mensagem.separador}
        </p>
      )}
      <div
        className={cn(
          'flex max-w-[85%] flex-col gap-1',
          daEquipe ? 'self-start' : 'self-end',
          mensagem.botoes?.length && 'min-w-[240px]',
        )}
      >
        <div
          className={cn(
            'rounded-lg px-2.5 pt-1.5 pb-1 text-[15px] leading-snug whitespace-pre-line shadow-sm',
            daEquipe ? 'rounded-tl-none bg-white' : 'rounded-tr-none bg-whatsapp-balao',
            mensagem.alerta && 'border-l-4 border-risco',
          )}
        >
          {mensagem.texto}
          <span className="mt-0.5 flex items-center justify-end gap-1 text-[12px] text-[#54656f]">
            {mensagem.hora}
            {!daEquipe && <CheckCheck className="size-4 text-[#027eb5]" aria-hidden />}
          </span>
          {mensagem.lista && (
            <button
              type="button"
              disabled={!ativa}
              onClick={aoAbrirLista}
              className="-mx-2.5 mt-1 flex min-h-11 w-[calc(100%+1.25rem)] items-center justify-center gap-2 border-t border-[#e9edef] text-[15px] font-medium text-[#00668a] disabled:text-[#54656f]"
            >
              <List className="size-5" aria-hidden />
              {mensagem.lista}
            </button>
          )}
        </div>
        {mensagem.botoes?.map((rotulo) =>
          rotulo === BOTOES_ALERTA[0] ? (
            <a
              key={rotulo}
              href="tel:188"
              className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white text-[15px] font-medium text-[#00668a] shadow-sm"
            >
              <Phone className="size-4" aria-hidden />
              {rotulo}
            </a>
          ) : (
            <button
              key={rotulo}
              type="button"
              disabled={!ativa}
              onClick={() => aoTocar(rotulo)}
              className="flex min-h-11 items-center justify-center rounded-lg bg-white text-[15px] font-medium text-[#00668a] shadow-sm disabled:text-[#54656f]"
            >
              {rotulo}
            </button>
          ),
        )}
      </div>
    </>
  )
}

function ListaWhatsApp({
  titulo,
  opcoes,
  fechar,
  escolher,
}: {
  titulo: string
  opcoes: { valor: string; rotulo: string }[]
  fechar: () => void
  escolher: (valor: string) => void
}) {
  const [marcada, setMarcada] = useState<string>()
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end bg-black/40">
      <div role="dialog" aria-modal aria-label={titulo} className="rounded-t-2xl bg-white pb-4">
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <button type="button" aria-label="Fechar lista" onClick={fechar} className="grid size-11 place-items-center">
            <X className="size-6 text-[#54656f]" aria-hidden />
          </button>
          <p className="flex-1 text-[17px] font-semibold">{titulo}</p>
        </div>
        <div role="radiogroup" aria-label={titulo} className="flex flex-col">
          {opcoes.map((o) => (
            <button
              key={o.valor}
              type="button"
              role="radio"
              aria-checked={marcada === o.valor}
              onClick={() => setMarcada(o.valor)}
              className="flex min-h-14 items-center justify-between border-b border-[#e9edef] px-5 text-left text-[17px]"
            >
              {o.rotulo}
              <span
                className={cn(
                  'grid size-6 place-items-center rounded-full border-2',
                  marcada === o.valor ? 'border-whatsapp-topo bg-whatsapp-topo' : 'border-[#8696a0]',
                )}
                aria-hidden
              >
                {marcada === o.valor && <Check className="size-4 text-white" />}
              </span>
            </button>
          ))}
        </div>
        <div className="px-4 pt-4">
          <button
            type="button"
            disabled={marcada === undefined}
            onClick={() => marcada !== undefined && escolher(marcada)}
            className="h-12 w-full rounded-full bg-whatsapp-topo text-[17px] font-semibold text-white disabled:bg-[#d1d7db] disabled:text-[#54656f]"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}
