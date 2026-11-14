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

## Contas de demonstração

O login é "Entrar com gov.br" para os três perfis. A etapa do gov.br é uma simulação do protótipo: não há integração real, e a tela seguinte pede o CPF e a senha abaixo. Senha de todas: `demo1234`.

| Perfil | CPF | Abre em |
|---|---|---|
| Paciente (Fernanda Rodrigues) | 111.111.111-11 | `/paciente` |
| Profissional (Enf. Juliana Costa) | 222.222.222-22 | `/equipe` |
| Psiquiatra (Dr. Marcos Lima) | 333.333.333-33 | `/psiquiatra` |

A conversa do WhatsApp da paciente Ana Beatriz fica em `/whatsapp` e não pede login. A barra de demonstração troca de perfil sem passar pela tela de login, com um clique ou com Alt+1 a Alt+4: as duas pacientes lado a lado (Ana no WhatsApp e Fernanda no site), depois Juliana e Marcos. A seta da barra recolhe ela.

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
