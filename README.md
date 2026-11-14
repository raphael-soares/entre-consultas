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

Abra o endereço que o Vite mostrar (por padrão http://localhost:5173). Tudo fica no navegador: as mudanças da demonstração são guardadas no `localStorage`, e o botão de reiniciar na barra de demonstração, no canto da tela, volta tudo ao estado inicial.

## Visões da demonstração

O botão "Entrar com gov.br" do login abre um menu para escolher quem entra; não há integração real com o gov.br nem senha.

| Visão | Abre em |
|---|---|
| Ana Beatriz, paciente pelo WhatsApp | `/whatsapp` |
| Fernanda Rodrigues, paciente pelo site | `/paciente` |
| Enf. Juliana Costa, equipe da unidade | `/equipe` |
| Dr. Marcos Lima, psiquiatra | `/psiquiatra` |

A barra de demonstração, no canto da tela, troca entre as mesmas visões sem voltar ao login, com um clique ou com Alt+1 a Alt+4. A seta da barra recolhe ela.

## Roteiro sugerido

1. Em `/whatsapp`, responda como a Ana e marque "Vários dias" na última pergunta, sobre pensar em se ferir.
2. Entre como Juliana: a Ana sobe para o topo da lista com o destaque Risco, e a evolução mostra o ponto novo com alerta e canal WhatsApp.
3. Abra o Carlos, que aparece com "Sugere encaminhamento", e encaminhe para o Dr. Marcos.
4. Entre como Marcos: o Carlos entra na lista de encaminhamentos como Novo, na ordem de prioridade, e o resumo abre com as respostas completas no painel à direita.
5. No resumo do Carlos, responda à unidade com conduta, medicação e quando reencaminhar.
6. Volte como Juliana: a ficha do Carlos mostra a orientação do Dr. Marcos.

## Comandos

| Comando | O que faz |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Checagem de tipos e build de produção em `dist/` |
| `pnpm preview` | Serve o build em http://localhost:4173 |
| `pnpm test` | Testes das regras de domínio (Vitest) |
| `pnpm lint` | oxlint |
| `pnpm prints` | Gera os 20 prints em `prints/` e falha se houver contraste abaixo de AA |

`pnpm prints` usa o Chromium do Playwright. Na primeira vez, rode `pnpm exec playwright install chromium`.
