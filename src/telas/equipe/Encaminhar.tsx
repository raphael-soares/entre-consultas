import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, Send } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { EscolhaUnica } from '@/componentes/EscolhaUnica'
import { ResumoGerado } from '@/componentes/ResumoGerado'
import { Button } from '@/componentes/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/componentes/ui/field'
import { Textarea } from '@/componentes/ui/textarea'
import { USUARIOS, nomeDoUsuario } from '@/dados/fixtures'
import { HOJE, dataLonga } from '@/dominio/hoje'
import { resumoEncaminhamento } from '@/dominio/resumo'
import { useFicha } from '@/estado/consultas'
import { useStore } from '@/estado/store'

const esquema = z.object({
  psiquiatraId: z.string({ error: 'Escolha o psiquiatra.' }).min(1, 'Escolha o psiquiatra.'),
  motivo: z.string().trim().min(1, 'Escreva o motivo.'),
  prejuizoFuncional: z.string().trim().min(1, 'Descreva o prejuízo funcional.'),
  tratamentos: z.string().trim().min(1, 'Conte os tratamentos já feitos.'),
})

type Valores = z.infer<typeof esquema>

const PSIQUIATRAS = USUARIOS.filter((u) => u.perfil === 'psiquiatra').map((u) => ({ valor: u.id, rotulo: u.nome }))

const CAMPOS_TEXTO: { nome: Exclude<keyof Valores, 'psiquiatraId'>; rotulo: string; descricao: string }[] = [
  { nome: 'motivo', rotulo: 'Motivo', descricao: 'Por que encaminhar agora.' },
  {
    nome: 'prejuizoFuncional',
    rotulo: 'Prejuízo funcional',
    descricao: 'Trabalho, estudo, cuidado da casa, vida social.',
  },
  { nome: 'tratamentos', rotulo: 'Tratamentos já feitos', descricao: 'Medicamentos, doses, tempo de uso e resposta.' },
]

export function Encaminhar() {
  const { id } = useParams()
  const ficha = useFicha(id)
  const encaminhar = useStore((s) => s.encaminhar)
  const navigate = useNavigate()
  const form = useForm<Valores>({
    resolver: zodResolver(esquema),
    defaultValues: { psiquiatraId: '', motivo: '', prejuizoFuncional: '', tratamentos: '' },
  })

  if (!ficha) return null
  const voltar = `/equipe/pacientes/${ficha.cadastro.id}`

  function enviar(valores: Valores) {
    encaminhar({ pacienteId: ficha!.cadastro.id, ...valores })
    toast.success(`Encaminhamento enviado para ${nomeDoUsuario(valores.psiquiatraId)}.`)
    navigate(voltar)
  }

  return (
    <div className="flex flex-col gap-6 px-8 pt-6 pb-24">
      <Button asChild variant="ghost" className="self-start px-2">
        <Link to={voltar}>
          <ChevronLeft aria-hidden />
          {ficha.cadastro.nome}
        </Link>
      </Button>
      <div>
        <h1 className="text-[34px] leading-tight font-bold tracking-tight">Encaminhar ao especialista</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">
          {ficha.cadastro.nome} · {dataLonga(HOJE)}
        </p>
      </div>

      {ficha.encaminhamento ? (
        <p className="rounded-xl bg-card p-5 text-[15px] ring-1 ring-border">
          {ficha.cadastro.nome} já foi encaminhado a {nomeDoUsuario(ficha.encaminhamento.psiquiatraId)} em{' '}
          {dataLonga(ficha.encaminhamento.data)}. Para mudar o psiquiatra, use Transferir na evolução.
        </p>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_400px] items-start gap-6">
          <form onSubmit={form.handleSubmit(enviar)} noValidate className="rounded-xl bg-card p-6 ring-1 ring-border">
            <FieldGroup>
              <Controller
                name="psiquiatraId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-[15px]">Psiquiatra</FieldLabel>
                    <EscolhaUnica
                      rotulo="Psiquiatra"
                      opcoes={PSIQUIATRAS}
                      valor={field.value || undefined}
                      aoMudar={field.onChange}
                      invalido={fieldState.invalid}
                      className="grid-cols-2"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              {CAMPOS_TEXTO.map((c) => (
                <Controller
                  key={c.nome}
                  name={c.nome}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={c.nome} className="text-[15px]">
                        {c.rotulo}
                      </FieldLabel>
                      <FieldDescription>{c.descricao}</FieldDescription>
                      <Textarea {...field} id={c.nome} rows={3} aria-invalid={fieldState.invalid} className="bg-card" />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              ))}
              <div className="flex justify-end gap-3">
                <Button asChild variant="outline">
                  <Link to={voltar}>Cancelar</Link>
                </Button>
                <Button type="submit">
                  <Send aria-hidden />
                  Enviar encaminhamento
                </Button>
              </div>
            </FieldGroup>
          </form>
          <section className="rounded-xl bg-card p-6 ring-1 ring-border">
            <h2 className="text-[17px] font-semibold">Resumo gerado pelo sistema</h2>
            <p className="mt-1 mb-5 text-[13px] text-muted-foreground">Vai junto com o encaminhamento. Não dá para editar.</p>
            <ResumoGerado
              resumo={resumoEncaminhamento(ficha.cadastro, ficha.acompanhamento, ficha.respostas, HOJE)}
            />
          </section>
        </div>
      )}
    </div>
  )
}
