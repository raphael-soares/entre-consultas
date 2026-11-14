import { ChevronLeft, Search, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { EscolhaUnica } from '@/componentes/EscolhaUnica'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import { Button } from '@/componentes/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/componentes/ui/field'
import { CADASTROS, USUARIOS } from '@/dados/fixtures'
import { HOJE, dataLonga, idade } from '@/dominio/hoje'
import { PERIODICIDADES } from '@/dominio/rotulos'
import type { Periodicidade } from '@/dominio/tipos'
import { acompanhamentoAtivo, useStore, useUsuarioLogado } from '@/estado/store'

const PROFISSIONAIS = USUARIOS.filter((u) => u.perfil === 'profissional').map((u) => ({
  valor: u.id,
  rotulo: `${u.nome}, ${u.funcao.toLowerCase()}`,
}))

// R.N. 004: nunca menos de 14 dias, porque o PHQ-9 pergunta sobre as últimas 2 semanas.
const OPCOES_PERIODICIDADE = PERIODICIDADES.map((p) => ({ valor: String(p), rotulo: `A cada ${p} dias` }))

export function Abrir() {
  const usuario = useUsuarioLogado()!
  const acompanhamentos = useStore((s) => s.acompanhamentos)
  const abrir = useStore((s) => s.abrirAcompanhamento)
  const navigate = useNavigate()
  const [pacienteId, setPacienteId] = useState<string>()
  const [periodicidade, setPeriodicidade] = useState('14')
  const [responsavelId, setResponsavelId] = useState(usuario.id)
  const [tentou, setTentou] = useState(false)

  const disponiveis = CADASTROS.filter((c) => !acompanhamentoAtivo(acompanhamentos, c.id))

  function confirmar() {
    setTentou(true)
    if (!pacienteId) return
    abrir({ pacienteId, periodicidade: Number(periodicidade) as Periodicidade, responsavelId })
    const nome = CADASTROS.find((c) => c.id === pacienteId)!.nome
    toast.success(`Acompanhamento de ${nome} aberto.`)
    navigate(responsavelId === usuario.id ? `/equipe/pacientes/${pacienteId}` : '/equipe')
  }

  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-6 px-8 pt-6 pb-24">
      <Button asChild variant="ghost" className="self-start px-2">
        <Link to="/equipe">
          <ChevronLeft aria-hidden />
          Meus pacientes
        </Link>
      </Button>
      <div>
        <h1 className="text-[34px] leading-tight font-bold tracking-tight">Abrir acompanhamento</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">Começa hoje, {dataLonga(HOJE)}.</p>
      </div>

      <section className="flex flex-col gap-6 rounded-xl bg-card p-6 ring-1 ring-border">
        <Field data-invalid={tentou && !pacienteId}>
          <FieldLabel className="text-[15px]">Paciente do cadastro e-SUS</FieldLabel>
          <FieldDescription>Quem tem cadastro na unidade e não está em acompanhamento.</FieldDescription>
          {disponiveis.length === 0 ? (
            <EstadoVazio icone={Search} titulo="Todos os cadastros já estão em acompanhamento" />
          ) : (
            <EscolhaUnica
              rotulo="Paciente"
              valor={pacienteId}
              aoMudar={setPacienteId}
              invalido={tentou && !pacienteId}
              opcoes={disponiveis.map((c) => ({
                valor: c.id,
                rotulo: `${c.nome}, ${idade(c.nascimento, HOJE)} anos${c.celular ? '' : ', sem celular'}`,
              }))}
            />
          )}
          {tentou && !pacienteId && <FieldError>Escolha o paciente.</FieldError>}
        </Field>
        <Field>
          <FieldLabel className="text-[15px]">Periodicidade do questionário</FieldLabel>
          <FieldDescription>O PHQ-9 pergunta sobre as últimas 2 semanas, por isso o mínimo é 14 dias.</FieldDescription>
          <EscolhaUnica
            rotulo="Periodicidade"
            valor={periodicidade}
            aoMudar={setPeriodicidade}
            opcoes={OPCOES_PERIODICIDADE}
            className="grid-cols-3"
          />
        </Field>
        <Field>
          <FieldLabel className="text-[15px]">Responsável</FieldLabel>
          <EscolhaUnica
            rotulo="Responsável"
            valor={responsavelId}
            aoMudar={setResponsavelId}
            opcoes={PROFISSIONAIS}
            className="grid-cols-2"
          />
        </Field>
      </section>

      <div className="flex justify-end gap-3">
        <Button asChild variant="outline">
          <Link to="/equipe">Cancelar</Link>
        </Button>
        <Button onClick={confirmar}>
          <UserPlus aria-hidden />
          Abrir acompanhamento
        </Button>
      </div>
    </div>
  )
}
