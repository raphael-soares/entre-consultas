import { mkdir } from 'node:fs/promises'
import AxeBuilder from '@axe-core/playwright'
import { chromium, type Browser } from '@playwright/test'
import { build, preview } from 'vite'

// Mesmo valor de CHAVE_ARMAZENAMENTO em src/estado/store.ts; importar a store traria o app inteiro para o Node.
const CHAVE_ARMAZENAMENTO = 'entre-consultas-demo-v1'

interface Print {
  arquivo: string
  url: string
  usuario?: 'fernanda' | 'juliana' | 'marcos'
  celular?: boolean
}

const PRINTS: Print[] = [
  { arquivo: '01-rf001-login', url: '/login' },
  { arquivo: '02-rf002-site-pergunta', url: '/paciente/questionario?passo=3', usuario: 'fernanda', celular: true },
  { arquivo: '03-rf002-site-estressores', url: '/paciente/questionario?passo=estressores', usuario: 'fernanda', celular: true },
  { arquivo: '04-rf002-site-alerta-cvv', url: '/paciente/questionario?passo=alerta', usuario: 'fernanda', celular: true },
  { arquivo: '05-rf002-whatsapp-pergunta', url: '/whatsapp?passo=pergunta-2&lista=aberta', celular: true },
  { arquivo: '06-rf002-whatsapp-estressores', url: '/whatsapp?passo=mais', celular: true },
  { arquivo: '07-rf002-whatsapp-alerta-cvv', url: '/whatsapp?passo=alerta', celular: true },
  { arquivo: '08-rf003-respostas-anteriores', url: '/paciente/respostas', usuario: 'fernanda', celular: true },
  { arquivo: '09-rf004-registrar-respostas', url: '/equipe/pacientes/luciana/registrar', usuario: 'juliana' },
  { arquivo: '10-rf005-abrir-acompanhamento', url: '/equipe/abrir', usuario: 'juliana' },
  { arquivo: '11-rf005-encerrar-acompanhamento', url: '/equipe/pacientes/fernanda?dialogo=encerrar', usuario: 'juliana' },
  { arquivo: '12-rf006-lista', url: '/equipe', usuario: 'juliana' },
  { arquivo: '13-rf007-evolucao', url: '/equipe/pacientes/maria', usuario: 'juliana' },
  { arquivo: '14-rf008-encaminhar', url: '/equipe/pacientes/carlos/encaminhar', usuario: 'juliana' },
  { arquivo: '15-rf009-encaminhamentos', url: '/psiquiatra', usuario: 'marcos' },
  { arquivo: '16-rf009-resumo', url: '/psiquiatra/encaminhamentos/roberto', usuario: 'marcos' },
  { arquivo: '17-rf010-lembrete-whatsapp', url: '/whatsapp?passo=lembrete', celular: true },
  { arquivo: '18-rf011-transferir', url: '/equipe/pacientes/joao?dialogo=transferir', usuario: 'juliana' },
  { arquivo: '19-rf012-responder', url: '/psiquiatra/encaminhamentos/tereza?painel=responder', usuario: 'marcos' },
  { arquivo: '20-rf012-orientacao', url: '/equipe/pacientes/roberto', usuario: 'juliana' },
]

async function fotografar(browser: Browser, base: string, print: Print): Promise<string[]> {
  const contexto = await browser.newContext({
    viewport: print.celular ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
  })
  if (print.usuario) {
    await contexto.addInitScript(
      ([chave, usuarioId]) =>
        localStorage.setItem(chave, JSON.stringify({ state: { sessao: { usuarioId } }, version: 0 })),
      [CHAVE_ARMAZENAMENTO, print.usuario],
    )
  }
  const pagina = await contexto.newPage()
  const erros: string[] = []
  pagina.on('pageerror', (e) => erros.push(e.message))
  const separador = print.url.includes('?') ? '&' : '?'
  await pagina.goto(`${base}${print.url}${separador}print=1`, { waitUntil: 'networkidle' })
  await pagina.evaluate(() => document.fonts.ready)
  await pagina.waitForTimeout(400)
  await pagina.screenshot({ path: `prints/${print.arquivo}.png` })

  const { violations } = await new AxeBuilder({ page: pagina }).withRules(['color-contrast']).analyze()
  await contexto.close()
  return [
    ...erros.map((e) => `erro na página: ${e}`),
    ...violations.flatMap((v) => v.nodes.map((n) => `contraste: ${n.target.join(' ')} (${n.failureSummary?.split('\n').at(-1)?.trim()})`)),
  ]
}

await build({ logLevel: 'warn' })
const servidor = await preview({ preview: { port: 4174, strictPort: false }, logLevel: 'warn' })
const base = servidor.resolvedUrls!.local[0].replace(/\/$/, '')
const browser = await chromium.launch()
await mkdir('prints', { recursive: true })

let falhas = 0
for (const print of PRINTS) {
  const problemas = await fotografar(browser, base, print)
  falhas += problemas.length
  console.log(`${problemas.length ? 'FALHOU' : 'ok    '} prints/${print.arquivo}.png`)
  for (const p of problemas) console.log(`       ${p}`)
}

await browser.close()
await servidor.close()
if (falhas) {
  console.error(`\n${falhas} problema(s) encontrados.`)
  process.exit(1)
}
console.log(`\n${PRINTS.length} prints sem violação de contraste.`)
