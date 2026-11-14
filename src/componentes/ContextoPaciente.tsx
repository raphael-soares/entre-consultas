import type { ReactNode } from 'react'
import { nomeEstressor } from '@/dominio/phq9'
import type { ResumoEncaminhamento } from '@/dominio/tipos'

export function CartaoLateral({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-xl bg-card p-5 ring-1 ring-border">
      <h2 className="text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">{titulo}</h2>
      <div className="mt-3 text-[15px]">{children}</div>
    </section>
  )
}

export function ContextoPaciente({
  estressores,
  contexto,
}: Pick<ResumoEncaminhamento, 'estressores' | 'contexto'>) {
  return (
    <>
      <CartaoLateral titulo="Estressores nas últimas 4 respostas">
        {estressores.length === 0 ? (
          <p className="text-muted-foreground">Nenhum marcado</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {estressores.map((e) => (
              <li key={e.estressor} className="flex items-center justify-between gap-3">
                <span>{nomeEstressor(e.estressor)}</span>
                <span className="text-[13px] text-muted-foreground tabular-nums">
                  {e.vezes} {e.vezes === 1 ? 'vez' : 'vezes'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CartaoLateral>
      <CartaoLateral titulo="Contexto social (e-SUS)">
        <dl className="flex flex-col gap-2">
          <div>
            <dt className="text-[13px] text-muted-foreground">Escolaridade</dt>
            <dd>{contexto.escolaridade}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-muted-foreground">Trabalho</dt>
            <dd>{contexto.trabalho}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-muted-foreground">Grupo comunitário</dt>
            <dd>{contexto.grupoComunitario}</dd>
          </div>
        </dl>
      </CartaoLateral>
    </>
  )
}
