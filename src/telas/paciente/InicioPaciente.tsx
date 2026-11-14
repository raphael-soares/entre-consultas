import { CalendarDays, ChevronRight, ClipboardList, LogOut, Phone } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import { Logo } from '@/componentes/Logo'
import { Button } from '@/componentes/ui/button'
import { CADASTROS, UNIDADE } from '@/dados/fixtures'
import { HOJE, dataPorExtenso, diasEntre } from '@/dominio/hoje'
import { useFicha } from '@/estado/consultas'
import { rascunhoVazio } from '@/estado/rascunho'
import { useStore, useUsuarioLogado } from '@/estado/store'

function quando(prevista: string): string {
  const dias = diasEntre(HOJE, prevista)
  if (dias <= 0) return 'Já pode responder'
  if (dias === 1) return 'Amanhã'
  return `Daqui a ${dias} dias`
}

export function InicioPaciente() {
  const usuario = useUsuarioLogado()!
  const ficha = useFicha(usuario.pacienteId)
  const totalRespostas = useStore((s) => s.respostas.filter((r) => r.pacienteId === usuario.pacienteId).length)
  const sair = useStore((s) => s.sair)
  const definirRascunho = useStore((s) => s.definirRascunho)
  const navigate = useNavigate()
  const cadastro = CADASTROS.find((c) => c.id === usuario.pacienteId)!
  const primeiroNome = cadastro.nome.split(' ')[0]

  return (
    <div className="flex flex-1 flex-col gap-5 px-5 pt-2 pb-6">
      <div className="flex items-center justify-between">
        <Logo compacto />
        <Button
          variant="ghost"
          onClick={() => {
            sair()
            navigate('/login')
          }}
        >
          <LogOut aria-hidden />
          Sair
        </Button>
      </div>

      <div>
        <h1 className="text-[34px] leading-tight font-bold tracking-tight">Olá, {primeiroNome}</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">{UNIDADE}</p>
      </div>

      {ficha ? (
        <section className="rounded-xl bg-card p-5 ring-1 ring-border">
          <p className="flex items-center gap-2 text-[15px] font-medium text-muted-foreground">
            <CalendarDays className="size-5 text-primary" aria-hidden />
            Próximo questionário
          </p>
          <p className="mt-1 text-[24px] leading-tight font-bold tracking-tight">{dataPorExtenso(ficha.prevista)}</p>
          <p className="text-[15px] font-medium text-primary">{quando(ficha.prevista)}</p>
          <p className="mt-2 text-[15px] text-muted-foreground">
            São 9 perguntas sobre as últimas 2 semanas. Leva uns 3 minutos e você pode responder antes, se quiser.
          </p>
          <Button
            size="lg"
            className="mt-4 w-full"
            onClick={() => {
              definirRascunho('site', rascunhoVazio())
              navigate('/paciente/questionario?passo=1')
            }}
          >
            Responder agora
          </Button>
        </section>
      ) : (
        <EstadoVazio
          icone={ClipboardList}
          titulo="Seu acompanhamento foi encerrado"
          texto="Se quiser voltar a responder, fale com a sua equipe na unidade."
          className="rounded-xl bg-card ring-1 ring-border"
        />
      )}

      <Link
        to="/paciente/respostas"
        className="flex min-h-14 items-center gap-3 rounded-xl bg-card px-5 py-4 ring-1 ring-border transition-colors hover:bg-accent"
      >
        <ClipboardList className="size-5 text-primary" aria-hidden />
        <span className="flex-1">
          <span className="block text-[17px] font-semibold">Respostas anteriores</span>
          <span className="block text-[15px] text-muted-foreground">
            {totalRespostas === 1 ? '1 resposta' : `${totalRespostas} respostas`}
          </span>
        </span>
        <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
      </Link>

      <a href="tel:188" className="mt-auto flex min-h-11 items-center gap-3 rounded-xl px-1 py-2 text-[15px]">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-card text-primary ring-1 ring-border">
          <Phone className="size-[18px]" aria-hidden />
        </span>
        <span className="flex flex-col leading-snug">
          <span className="font-medium">Precisa conversar agora?</span>
          <span className="text-muted-foreground">Ligue 188 (CVV), grátis, 24 horas</span>
        </span>
      </a>
    </div>
  )
}
