import { zodResolver } from '@hookform/resolvers/zod'
import { MessageCircle } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { Logo } from '@/componentes/Logo'
import { INICIO_DO_PERFIL } from '@/lib/rotas'
import { Button } from '@/componentes/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/componentes/ui/field'
import { Input } from '@/componentes/ui/input'
import { UNIDADE } from '@/dados/fixtures'
import { useStore } from '@/estado/store'

const esquema = z.object({
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'Digite os 11 números do CPF.'),
  senha: z.string().min(1, 'Digite a senha.'),
})

type Valores = z.infer<typeof esquema>

function mascararCpf(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

export function Login() {
  const entrar = useStore((s) => s.entrar)
  const navigate = useNavigate()
  const form = useForm<Valores>({ resolver: zodResolver(esquema), defaultValues: { cpf: '', senha: '' } })

  function enviar(valores: Valores) {
    const usuario = entrar(valores.cpf, valores.senha)
    if (!usuario) {
      form.setError('senha', { message: 'CPF ou senha incorretos.' })
      return
    }
    navigate(INICIO_DO_PERFIL[usuario.perfil])
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 px-4 py-10">
      <Logo />
      <div className="w-full max-w-[420px] rounded-xl bg-card p-8 ring-1 ring-border">
        <h1 className="text-[34px] leading-tight font-bold tracking-tight">Entrar</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">Use seu CPF e a senha cadastrada na unidade de saúde.</p>
        <form onSubmit={form.handleSubmit(enviar)} className="mt-8" noValidate>
          <FieldGroup>
            <Controller
              name="cpf"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="cpf" className="text-[15px]">
                    CPF
                  </FieldLabel>
                  <Input
                    {...field}
                    id="cpf"
                    inputMode="numeric"
                    autoComplete="username"
                    placeholder="000.000.000-00"
                    aria-invalid={fieldState.invalid}
                    onChange={(e) => field.onChange(mascararCpf(e.target.value))}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="senha"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="senha" className="text-[15px]">
                    Senha
                  </FieldLabel>
                  <Input {...field} id="senha" type="password" autoComplete="current-password" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Button type="submit" size="lg" className="w-full">
              Entrar
            </Button>
          </FieldGroup>
        </form>
      </div>
      <p className="flex max-w-[420px] items-start gap-2 text-center text-[15px] text-muted-foreground">
        <MessageCircle className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        Paciente também pode responder pela conversa no WhatsApp, sem senha.
      </p>
      <p className="text-[13px] text-muted-foreground">{UNIDADE} · protótipo com dados fictícios</p>
    </main>
  )
}
