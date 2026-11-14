import { ChevronRight, Inbox } from 'lucide-react'
import { Link } from 'react-router'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import { CADASTROS, UNIDADE, nomeDoUsuario } from '@/dados/fixtures'
import { HOJE, dataLonga, idade } from '@/dominio/hoje'
import { useEncaminhamentosDe } from '@/estado/consultas'
import { useUsuarioLogado } from '@/estado/store'

export function ListaEncaminhamentos() {
  const usuario = useUsuarioLogado()!
  const encaminhamentos = useEncaminhamentosDe(usuario.id)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[34px] leading-tight font-bold tracking-tight">Encaminhamentos recebidos</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">
          Pacientes que a atenção primária encaminhou para você, do mais recente para o mais antigo.
        </p>
      </div>
      {encaminhamentos.length === 0 ? (
        <EstadoVazio
          icone={Inbox}
          titulo="Nenhum encaminhamento por enquanto"
          texto="Quando uma equipe encaminhar um paciente para você, ele aparece aqui com o histórico do acompanhamento."
          className="rounded-xl bg-card py-16 ring-1 ring-border"
        />
      ) : (
        <ul className="overflow-hidden rounded-xl bg-card ring-1 ring-border">
          {encaminhamentos.map((e) => {
            const cadastro = CADASTROS.find((c) => c.id === e.pacienteId)!
            return (
              <li key={e.id} className="border-b last:border-b-0">
                <Link
                  to={`encaminhamentos/${e.id}`}
                  className="grid grid-cols-[220px_minmax(0,1fr)_auto] items-center gap-6 px-5 py-4 transition-colors hover:bg-background"
                >
                  <div>
                    <p className="text-[17px] font-semibold">{cadastro.nome}</p>
                    <p className="text-[13px] text-muted-foreground">
                      {idade(cadastro.nascimento, HOJE)} anos · {UNIDADE}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-[15px]">{e.motivo}</p>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                      Encaminhado por {nomeDoUsuario(e.profissionalId)} em {dataLonga(e.data)}
                    </p>
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
