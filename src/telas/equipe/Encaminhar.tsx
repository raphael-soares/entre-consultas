import { zodResolver } from '@hookform/resolvers/zod'
import { Send } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { FolhaLateral } from '@/componentes/FolhaLateral'
import { ResumoGerado } from '@/componentes/ResumoGerado'
import { Button } from '@/componentes/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/componentes/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentes/ui/select'
import { Textarea } from '@/componentes/ui/textarea'
import { USUARIOS, nomeDoUsuario } from '@/dados/fixtures'
import { HOJE, dataPorExtenso } from '@/dominio/hoje'
import { resumoEncaminhamento } from '@/dominio/resumo'
import { useFicha } from '@/estado/consultas'
import { useStore } from '@/estado/store'
import { cn } from '@/lib/utils'

const esquema = z.object({
  psiquiatraId: z.string({ error: 'Escolha o psiquiatra.' }).min(1, 'Escolha o psiquiatra.'),
  motivo: z.string().trim().min(1, 'Escreva o motivo.'),
  prejuizoFuncional: z.string().trim().min(1, 'Descreva o prejuízo funcional.'),
  tratamentos: z.string().trim().min(1, 'Conte os tratamentos já feitos.'),
})

type Valores = z.infer<typeof esquema>

const PSIQUIATRAS = USUARIOS.filter((u) => u.perfil === 'psiquiatra')

const CAMPOS_TEXTO: { nome: Exclude<keyof Valores, 'psiquiatraId'>; rotulo: string; descricao: string }[] = [
  { nome: 'motivo', rotulo: 'Motivo', descricao: 'Por que encaminhar agora.' },
  {
    nome: 'prejuizoFuncional',
    rotulo: 'Prejuízo funcional',
    descricao: 'Trabalho, estudo, cuidado da casa, vida social.',
  },
  { nome: 'tratamentos', rotulo: 'Tratamentos já feitos', descricao: 'Medicamentos, doses, tempo de uso e resposta.' },
]

function quemRecebe(psiquiatraId: string) {
  if (!psiquiatraId) return 'O psiquiatra vai receber'
  const nome = nomeDoUsuario(psiquiatraId)
  const [titulo, primeiro] = nome.split(' ')
  return `${titulo === 'Dra.' ? 'A' : 'O'} ${titulo} ${primeiro} vai receber`
}

export function Encaminhar() {
  const { id } = useParams()
  const ficha = useFicha(id)
  const encaminhar = useStore((s) => s.encaminhar)
  const navigate = useNavigate()
  const form = useForm<Valores>({
    resolver: zodResolver(esquema),
    defaultValues: { psiquiatraId: '', motivo: '', prejuizoFuncional: '', tratamentos: '' },
  })
  const escrito = useWatch({ control: form.control })

  if (!ficha) return null
  const voltar = `/equipe/pacientes/${ficha.cadastro.id}`

  function enviar(valores: Valores) {
    encaminhar({ pacienteId: ficha!.cadastro.id, ...valores })
    toast.success(`Encaminhamento enviado para ${nomeDoUsuario(valores.psiquiatraId)}.`)
    navigate(voltar)
  }

  const fechar = (
    <Button asChild variant="outline">
      <Link to={voltar}>{ficha.encaminhamento ? 'Fechar' : 'Cancelar'}</Link>
    </Button>
  )

  return (
    <FolhaLateral
      titulo="Encaminhar ao especialista"
      descricao={`${ficha.cadastro.nome} · ${dataPorExtenso(HOJE)}`}
      aoFechar={() => navigate(voltar)}
      className="data-[side=right]:sm:max-w-[1000px]"
      rodape={
        ficha.encaminhamento ? (
          fechar
        ) : (
          <>
            {fechar}
            <Button type="submit" form="encaminhar-especialista">
              <Send aria-hidden />
              Enviar encaminhamento
            </Button>
          </>
        )
      }
    >
      {ficha.encaminhamento ? (
        <p className="rounded-xl bg-card p-5 text-[15px] ring-1 ring-border">
          {ficha.cadastro.nome} já foi encaminhado a {nomeDoUsuario(ficha.encaminhamento.psiquiatraId)} em{' '}
          {dataPorExtenso(ficha.encaminhamento.data)}. Para mudar o psiquiatra, use Transferir na evolução.
        </p>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_380px] items-start gap-5">
          <form
            id="encaminhar-especialista"
            onSubmit={form.handleSubmit(enviar)}
            noValidate
            className="rounded-xl bg-card p-5 ring-1 ring-border"
          >
            <FieldGroup>
              <Controller
                name="psiquiatraId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="psiquiatra" className="text-[15px]">
                      Psiquiatra
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="psiquiatra"
                        aria-invalid={fieldState.invalid}
                        className="w-full text-[15px] data-[size=default]:h-11"
                      >
                        <SelectValue placeholder="Escolha o psiquiatra" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {PSIQUIATRAS.map((p) => (
                          <SelectItem key={p.id} value={p.id} className="min-h-11 text-[15px]">
                            {p.nome}, psiquiatra
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
            </FieldGroup>
          </form>

          <aside aria-label="Prévia do encaminhamento" className="sticky top-0 rounded-xl bg-card p-5 ring-1 ring-border">
            <h2 className="text-[17px] font-semibold">{quemRecebe(escrito.psiquiatraId ?? '')}</h2>
            <p className="mt-0.5 mb-4 text-[13px] text-muted-foreground">
              O que você escreve aparece aqui. O resumo do acompanhamento é gerado pelo sistema e não dá para editar.
            </p>
            <div className="flex flex-col gap-3 border-b pb-4">
              {CAMPOS_TEXTO.map((c) => {
                const texto = escrito[c.nome]?.trim()
                return (
                  <div key={c.nome}>
                    <p className="text-[12px] font-medium text-muted-foreground">{c.rotulo}</p>
                    <p className={cn('text-[14px] leading-snug whitespace-pre-line', !texto && 'text-muted-foreground')}>
                      {texto || 'Ainda não escrito.'}
                    </p>
                  </div>
                )
              })}
            </div>
            <div className="pt-4">
              <ResumoGerado
                resumo={resumoEncaminhamento(ficha.cadastro, ficha.acompanhamento, ficha.respostas, HOJE)}
              />
            </div>
          </aside>
        </div>
      )}
    </FolhaLateral>
  )
}
