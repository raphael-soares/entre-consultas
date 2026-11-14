// Data fixa da demonstração (dia da apresentação), para estados e prints estáveis.
export const HOJE = '2026-11-27'

const DIA_MS = 86_400_000

function paraMs(iso: string): number {
  const [ano, mes, dia] = iso.split('-').map(Number)
  return Date.UTC(ano, mes - 1, dia)
}

export function somarDias(iso: string, dias: number): string {
  return new Date(paraMs(iso) + dias * DIA_MS).toISOString().slice(0, 10)
}

export function diasEntre(de: string, ate: string): number {
  return Math.round((paraMs(ate) - paraMs(de)) / DIA_MS)
}

export function semanasEntre(de: string, ate: string): number {
  return Math.floor(diasEntre(de, ate) / 7)
}

export function dataCurta(iso: string): string {
  const [, mes, dia] = iso.split('-')
  return `${dia}/${mes}`
}

export function dataLonga(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

const POR_EXTENSO = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })

export function dataPorExtenso(iso: string): string {
  const texto = POR_EXTENSO.format(paraMs(iso))
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export function idade(nascimento: string, hoje: string): number {
  const [an, mn, dn] = nascimento.split('-').map(Number)
  const [ah, mh, dh] = hoje.split('-').map(Number)
  return ah - an - (mh < mn || (mh === mn && dh < dn) ? 1 : 0)
}

export function paraTempo(iso: string): number {
  return paraMs(iso)
}
