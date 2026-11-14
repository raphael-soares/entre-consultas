import { nomeDoUsuario } from '@/dados/fixtures'
import { NOMES_SITUACAO, situacaoEncaminhamento } from '@/dominio/encaminhamento'
import { dataPorExtenso } from '@/dominio/hoje'
import type { Encaminhamento } from '@/dominio/tipos'
import { cn } from '@/lib/utils'
import { CartaoLateral } from './ContextoPaciente'

const aPsiquiatra = (nome: string) => `${nome.startsWith('Dra.') ? 'à' : 'a'} ${nome}`
const doPsiquiatra = (nome: string) => `${nome.startsWith('Dra.') ? 'da' : 'do'} ${nome}`

function Linha({ titulo, legenda }: { titulo: string; legenda?: string }) {
  return (
    <li>
      <p>{titulo}</p>
      {legenda && <p className="text-[12px] text-muted-foreground">{legenda}</p>}
    </li>
  )
}

export function CartaoEncaminhamento({ encaminhamento: e }: { encaminhamento: Encaminhamento }) {
  const situacao = situacaoEncaminhamento(e)
  const psiquiatra = nomeDoUsuario(e.psiquiatraId)
  const contra = e.contrarreferencia
  return (
    <CartaoLateral titulo="Encaminhamento">
      <p className="-mt-1 mb-2.5 flex items-center gap-1.5 text-[13px] font-medium">
        <span
          className={cn('size-2 rounded-full', situacao === 'respondido' ? 'bg-primary' : 'bg-muted-foreground')}
          aria-hidden
        />
        {NOMES_SITUACAO[situacao]}
      </p>
      <ul className="flex flex-col gap-2.5">
        <Linha
          titulo={`Encaminhado ${aPsiquiatra(psiquiatra)}`}
          legenda={`${dataPorExtenso(e.data)}, por ${nomeDoUsuario(e.profissionalId)}`}
        />
        {e.vistoEm && <Linha titulo="Visto" legenda={dataPorExtenso(e.vistoEm)} />}
        {e.consulta && <Linha titulo={`Consulta marcada para ${dataPorExtenso(e.consulta.data).toLowerCase()}`} />}
      </ul>
      {contra && (
        <div className="mt-3.5 flex flex-col gap-2.5 border-t pt-3.5">
          <div>
            <h3 className="text-[14px] font-semibold">Orientação {doPsiquiatra(psiquiatra)}</h3>
            <p className="text-[12px] text-muted-foreground">{dataPorExtenso(contra.data)}</p>
          </div>
          {(
            [
              ['Conduta', contra.conduta],
              ['Medicação', contra.medicacao],
              ['Reencaminhar se', contra.reencaminharSe],
            ] as const
          ).map(([rotulo, texto]) => (
            <div key={rotulo}>
              <p className="text-[12px] font-medium text-muted-foreground">{rotulo}</p>
              <p className="leading-snug">{texto}</p>
            </div>
          ))}
        </div>
      )}
    </CartaoLateral>
  )
}
