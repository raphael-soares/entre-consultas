# Entre Consultas

Acompanhamento do tratamento da depressão na atenção primária do SUS.

Trabalho final de Análise de Sistemas e de Requisitos de Software II (UDESC, 2026). O sistema é só modelado: este repositório guarda o protótipo navegável em React, com dados fictícios e sem backend.

A especificação completa (requisitos, regras de negócio, histórias de usuário, casos de uso e telas) está em [`docs/spec.md`](docs/spec.md).

## Como rodar

Precisa de Node 22 ou mais novo e do pnpm.

```sh
pnpm install
pnpm dev
```

Abra o endereço que o Vite mostrar (por padrão http://localhost:5173). Tudo fica no navegador: as mudanças da demonstração são guardadas no `localStorage` e o botão "Demonstração", no canto da tela, volta tudo ao estado inicial.

## Contas de demonstração

Senha de todas: `demo1234`.

| Perfil | CPF | Abre em |
|---|---|---|
| Paciente (Fernanda Rodrigues) | 111.111.111-11 | `/paciente` |
| Profissional (Enf. Juliana Costa) | 222.222.222-22 | `/equipe` |
| Psiquiatra (Dr. Marcos Lima) | 333.333.333-33 | `/psiquiatra` |

A conversa do WhatsApp da paciente Ana Beatriz fica em `/whatsapp` e não pede login. O botão "Demonstração" também troca de perfil sem passar pela tela de login.

## Roteiro sugerido

1. Em `/whatsapp`, responda como a Ana e marque "Vários dias" na última pergunta, sobre pensar em se ferir.
2. Entre como Juliana: a Ana sobe para o topo da lista com o destaque Risco, e a evolução mostra o ponto novo com alerta e canal WhatsApp.
3. Abra o Carlos, que aparece com "Sugere encaminhamento", e encaminhe para o Dr. Marcos.
4. Entre como Marcos: o Carlos entra na lista de encaminhamentos na ordem de prioridade, e o resumo abre com as respostas completas no painel à direita.

## Comandos

| Comando | O que faz |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Checagem de tipos e build de produção em `dist/` |
| `pnpm preview` | Serve o build em http://localhost:4173 |
| `pnpm test` | Testes das regras de domínio (Vitest) |
| `pnpm lint` | oxlint |
| `pnpm prints` | Gera os 18 prints em `prints/` e falha se houver contraste abaixo de AA |

`pnpm prints` usa o Chromium do Playwright. Na primeira vez, rode `pnpm exec playwright install chromium`.
