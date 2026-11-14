import type { ReactNode } from 'react'
import { nomeEstressor } from '@/dominio/phq9'
import { estressoresMaisMarcados } from '@/dominio/resumo'
import type { Ficha } from '@/estado/consultas'

export function CartaoLateral({
  titulo,
  legenda,
  children,
}: {
  titulo: string
  legenda?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl bg-card px-5 py-4 ring-1 ring-border">
      <h2 className="text-[15px] font-semibold">{titulo}</h2>
      {legenda && <p className="text-[12px] text-muted-foreground">{legenda}</p>}
      <div className="mt-2.5 text-[14px]">{children}</div>
    </section>
  )
}

export function ContextoPaciente({ ficha }: { ficha: Pick<Ficha, 'respostas' | 'cadastro'> }) {
  const estressores = estressoresMaisMarcados(ficha.respostas)
  return (
    <>
      <CartaoLateral titulo="Estressores" legenda="Nas últimas 4 respostas">
        {estressores.length === 0 ? (
          <p className="text-muted-foreground">Nenhum marcado</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {estressores.map((e) => (
              <li key={e.estressor} className="flex items-center justify-between gap-3">
                <span>{nomeEstressor(e.estressor)}</span>
                <span className="text-[12px] text-muted-foreground tabular-nums">
                  {e.vezes} {e.vezes === 1 ? 'vez' : 'vezes'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CartaoLateral>
      <ContextoSocial cadastro={ficha.cadastro} />
    </>
  )
}

export function ContextoSocial({ cadastro, emLinha = false }: { cadastro: Ficha['cadastro']; emLinha?: boolean }) {
  const { escolaridade, trabalho, grupoComunitario } = cadastro
  return (
    <CartaoLateral titulo="Contexto social" legenda="Do cadastro no e-SUS">
      <dl className={emLinha ? 'grid grid-cols-3 gap-4' : 'flex flex-col gap-1.5'}>
        {(
          [
            ['Escolaridade', escolaridade],
            ['Trabalho', trabalho],
            ['Grupo comunitário', grupoComunitario],
          ] as const
        ).map(([rotulo, valor]) => (
          <div key={rotulo}>
            <dt className="text-[12px] text-muted-foreground">{rotulo}</dt>
            <dd>{valor}</dd>
          </div>
        ))}
      </dl>
    </CartaoLateral>
  )
}
