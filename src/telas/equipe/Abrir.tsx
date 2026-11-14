import { Check, Search, UserPlus } from 'lucide-react'
import { useId, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import { FolhaLateral } from '@/componentes/FolhaLateral'
import { Segmentado } from '@/componentes/Segmentado'
import { Button } from '@/componentes/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/componentes/ui/field'
import { Input } from '@/componentes/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentes/ui/select'
import { CADASTROS, USUARIOS } from '@/dados/fixtures'
import { HOJE, dataPorExtenso, idade } from '@/dominio/hoje'
import { PERIODICIDADES } from '@/dominio/rotulos'
import type { Periodicidade } from '@/dominio/tipos'
import { acompanhamentoAtivo, useStore, useUsuarioLogado } from '@/estado/store'
import { cn } from '@/lib/utils'
import { InicioEquipe } from './InicioEquipe'

const PROFISSIONAIS = USUARIOS.filter((u) => u.perfil === 'profissional')

// R.N. 004: nunca menos de 14 dias, porque o PHQ-9 pergunta sobre as últimas 2 semanas.
const OPCOES_PERIODICIDADE = PERIODICIDADES.map((p) => ({ valor: String(p), rotulo: `${p} dias` }))

const simplificar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

export function Abrir() {
  const usuario = useUsuarioLogado()!
  const acompanhamentos = useStore((s) => s.acompanhamentos)
  const abrir = useStore((s) => s.abrirAcompanhamento)
  const navigate = useNavigate()
  const idLista = useId()
  const [busca, setBusca] = useState('')
  const [pacienteId, setPacienteId] = useState<string>()
  const [ativa, setAtiva] = useState(0)
  const [periodicidade, setPeriodicidade] = useState('14')
  const [responsavelId, setResponsavelId] = useState(usuario.id)
  const [tentou, setTentou] = useState(false)

  const disponiveis = CADASTROS.filter((c) => !acompanhamentoAtivo(acompanhamentos, c.id))
  const filtrados = disponiveis.filter((c) => simplificar(c.nome).includes(simplificar(busca)))
  const indiceAtivo = Math.min(ativa, filtrados.length - 1)

  function escolher(id: string) {
    setPacienteId(id)
    setBusca(CADASTROS.find((c) => c.id === id)!.nome)
  }

  function teclar(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const passo = e.key === 'ArrowDown' ? 1 : -1
      setAtiva(filtrados.length ? (indiceAtivo + passo + filtrados.length) % filtrados.length : 0)
    } else if (e.key === 'Enter') {
      const alvo = filtrados[indiceAtivo]
      if (alvo && alvo.id !== pacienteId) {
        e.preventDefault()
        escolher(alvo.id)
      }
    }
  }

  function confirmar(e: FormEvent) {
    e.preventDefault()
    setTentou(true)
    if (!pacienteId) return
    abrir({ pacienteId, periodicidade: Number(periodicidade) as Periodicidade, responsavelId })
    const nome = CADASTROS.find((c) => c.id === pacienteId)!.nome
    toast.success(`Acompanhamento de ${nome} aberto.`)
    navigate(responsavelId === usuario.id ? `/equipe/pacientes/${pacienteId}` : '/equipe')
  }

  return (
    <>
      <InicioEquipe />
      <FolhaLateral
        titulo="Abrir acompanhamento"
        descricao={`Começa hoje, ${dataPorExtenso(HOJE).toLowerCase()}.`}
        aoFechar={() => navigate('/equipe')}
        className="data-[side=right]:sm:max-w-[560px]"
        rodape={
          <>
            <Button asChild variant="outline">
              <Link to="/equipe">Cancelar</Link>
            </Button>
            <Button type="submit" form="abrir-acompanhamento">
              <UserPlus aria-hidden />
              Abrir acompanhamento
            </Button>
          </>
        }
      >
        <form
          id="abrir-acompanhamento"
          onSubmit={confirmar}
          noValidate
          className="flex flex-col gap-6 rounded-xl bg-card p-5 ring-1 ring-border"
        >
          <Field data-invalid={tentou && !pacienteId}>
            <FieldLabel htmlFor="busca-paciente" className="text-[15px]">
              Paciente do cadastro e-SUS
            </FieldLabel>
            <FieldDescription>Quem tem cadastro na unidade e não está em acompanhamento.</FieldDescription>
            {disponiveis.length === 0 ? (
              <EstadoVazio icone={Search} titulo="Todos os cadastros já estão em acompanhamento" />
            ) : (
              <>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    id="busca-paciente"
                    role="combobox"
                    aria-expanded
                    aria-controls={idLista}
                    aria-autocomplete="list"
                    aria-activedescendant={filtrados.length ? `${idLista}-${filtrados[indiceAtivo].id}` : undefined}
                    aria-invalid={tentou && !pacienteId}
                    autoComplete="off"
                    placeholder="Buscar pelo nome"
                    value={busca}
                    onChange={(e) => {
                      setBusca(e.target.value)
                      setPacienteId(undefined)
                      setAtiva(0)
                    }}
                    onKeyDown={teclar}
                    className="h-11 pl-9 text-[15px]"
                  />
                </div>
                <ul id={idLista} role="listbox" aria-label="Cadastros" className="flex flex-col gap-0.5">
                  {filtrados.map((c, i) => {
                    const marcado = c.id === pacienteId
                    return (
                      <li
                        key={c.id}
                        id={`${idLista}-${c.id}`}
                        role="option"
                        aria-selected={marcado}
                        onClick={() => escolher(c.id)}
                        onMouseMove={() => setAtiva(i)}
                        className={cn(
                          'flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-1.5',
                          i === indiceAtivo && 'bg-muted',
                          marcado && 'bg-accent',
                        )}
                      >
                        <span>
                          <span className="block text-[15px] leading-snug">{c.nome}</span>
                          <span className="block text-[13px] text-muted-foreground">
                            {idade(c.nascimento, HOJE)} anos{c.celular ? '' : ', sem celular'}
                          </span>
                        </span>
                        {marcado && <Check className="size-4 text-primary" aria-hidden />}
                      </li>
                    )
                  })}
                  {filtrados.length === 0 && (
                    <li role="presentation" className="px-3 py-2 text-[14px] text-muted-foreground">
                      Nenhum cadastro com esse nome.
                    </li>
                  )}
                </ul>
              </>
            )}
            {tentou && !pacienteId && <FieldError>Escolha o paciente.</FieldError>}
          </Field>

          <Field>
            <FieldLabel className="text-[15px]">Periodicidade do questionário</FieldLabel>
            <FieldDescription>O PHQ-9 pergunta sobre as últimas 2 semanas, por isso o mínimo é 14 dias.</FieldDescription>
            <Segmentado
              rotulo="Periodicidade do questionário"
              valor={periodicidade}
              aoMudar={setPeriodicidade}
              opcoes={OPCOES_PERIODICIDADE}
              className="w-full"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="responsavel" className="text-[15px]">
              Responsável
            </FieldLabel>
            <Select value={responsavelId} onValueChange={setResponsavelId}>
              <SelectTrigger id="responsavel" className="w-full text-[15px] data-[size=default]:h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {PROFISSIONAIS.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="min-h-11 text-[15px]">
                    {p.nome}, {p.funcao.toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </form>
      </FolhaLateral>
    </>
  )
}
