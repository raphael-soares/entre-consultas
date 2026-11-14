# Especificação do Entre Consultas

## Problema

Na unidade básica do SUS, a equipe só sabe como o paciente com depressão está quando ele volta à consulta, e o psiquiatra recebe o encaminhamento sem histórico. O paciente responde um questionário periódico (PHQ-9 e estressores), a equipe de saúde da família acompanha a evolução entre as consultas, e o psiquiatra recebe o encaminhamento já com o histórico.

Fora do escopo: prontuário, agendamento, teleconsulta e prescrição.

## Atores

- Paciente: responde pelo WhatsApp ou pelo site no celular (PWA, sem instalar).
- Profissional da unidade: web.
- Psiquiatra: web.

Integrações externas do sistema modelado (no protótipo, só imitação visual):

- e-SUS APS, cadastro individual: nome, celular, escolaridade, situação no mercado de trabalho, grupo comunitário. Dá o contexto social do paciente.
- WhatsApp (API oficial para empresas): envia o lembrete e conduz a conversa do questionário.

O paciente responde por três canais, o que quiser a cada vez: conversa no WhatsApp, site (com login) ou o profissional registrando na unidade ou na visita domiciliar.

## Requisitos funcionais

"Todos" na coluna Usuários não é ator: marca o requisito comum aos três. A coluna Nome é o título da tela.

| R.F. | Nome | Usuários | Dados | R.F. associados | R.N. associadas |
|---|---|---|---|---|---|
| 001 | Autenticar usuário | Todos | CPF (vindo da conta gov.br), perfil (paciente, profissional da unidade, psiquiatra) | todos | 005, 006 |
| 002 | Responder questionário | Paciente | canal (WhatsApp ou site), 9 respostas do PHQ-9 (0 a 3 cada), pontuação total (calculada, nunca mostrada ao paciente), estressores marcados (trabalho ou desemprego, família ou relacionamentos, dinheiro, saúde física, moradia, luto, outro com texto livre), data | 003, 006, 007, 010 | 001, 002, 004, 008 |
| 003 | Ver respostas anteriores | Paciente | por resposta: data, canal, as 9 perguntas com a opção marcada, estressores | 002 | 005 |
| 004 | Registrar respostas pelo paciente | Profissional da unidade | paciente, as mesmas respostas do R.F. 002, local (unidade ou visita domiciliar), profissional que registrou | 002, 007 | 001, 002 |
| 005 | Abrir e encerrar acompanhamento | Profissional da unidade | abertura: paciente (do cadastro e-SUS), data de início, periodicidade, responsável. Encerramento: data e motivo (remissão, mudança de unidade, desistência do paciente, outro) | 006, 010, 011 | 004 |
| 006 | Listar pacientes acompanhados | Profissional da unidade | nome, última pontuação e faixa, data da última resposta, data prevista da próxima, destaque | 007, 011 | 001, 003, 008 |
| 007 | Ver evolução do paciente | Profissional da unidade, Psiquiatra | gráfico das pontuações com faixas, respostas da pergunta 9, períodos sem resposta, canal de cada resposta, resposta ao tratamento, estressores mais marcados, contexto social do cadastro e-SUS | 002, 004, 008 | 003, 006, 007 |
| 008 | Encaminhar ao especialista | Profissional da unidade | paciente, psiquiatra de destino, motivo, resumo gerado (pontuação inicial e atual, semanas de acompanhamento, pergunta 9 ao longo do tempo, estressores, contexto social), campos do profissional (prejuízo funcional, tratamentos já feitos), data | 007, 009 | 003, 006 |
| 009 | Ver encaminhamentos recebidos | Psiquiatra | lista (paciente, situação, última pontuação e faixa, motivo, data) e resumo do encaminhamento | 007, 008, 012 | 006, 011 |
| 010 | Receber lembrete do questionário | Paciente | celular, data prevista, botões "Responder aqui" (abre a conversa no WhatsApp) e "Responder no site" (link) | 002, 005 | 004, 009 |
| 011 | Transferir paciente | Profissional da unidade | tipo (acompanhamento ou encaminhamento), destino, motivo (férias, afastamento, desligamento, outro), data, quem transferiu | 005, 006, 008 | 010 |
| 012 | Responder encaminhamento | Psiquiatra, Profissional da unidade | contrarreferência: conduta, medicação, quando reencaminhar, data. A unidade lê a situação e a orientação na evolução do paciente | 007, 008, 009 | 011 |

No WhatsApp o paciente é reconhecido pelo número do cadastro, sem login; o login do R.F. 001 vale para o site e usa a conta gov.br para os três perfis. O resumo do R.F. 008 cobre o que a linha de cuidado exige no encaminhamento: quadro atual e ideação saem do sistema; prejuízo funcional e tratamentos já feitos o profissional preenche. O R.F. 012 fecha o ciclo: o encaminhamento volta para a unidade com a orientação do especialista, e a unidade continua coordenando o cuidado.

## Regras de negócio

| ID | Grupo | Regra |
|---|---|---|
| R.N. 001 | Segurança do paciente | Resposta diferente de "nenhuma vez" na pergunta 9 do PHQ-9, em qualquer canal, mostra na hora o CVV (188, gratuito, 24 horas) e marca o paciente como Risco na lista da equipe. No WhatsApp, vira uma mensagem logo depois da pergunta. O destaque fica até a próxima resposta. O sistema não acompanha em tempo real |
| R.N. 002 | Rastreio | PHQ-9 com 9 pontos ou mais é rastreio positivo (regra da linha de cuidado do SUS) |
| R.N. 003 | Encaminhamento | O sistema sugere encaminhar quando, depois de 16 semanas de acompanhamento, a pontuação não caiu 5 pontos desde a primeira resposta, ou quando a pergunta 9 continua positiva em respostas que cobrem 12 semanas. Quem decide é o profissional |
| R.N. 004 | Acompanhamento | Ao abrir o acompanhamento, o profissional escolhe a periodicidade: 14, 21 ou 28 dias. Padrão de 14. Nunca menos de 14, porque o PHQ-9 pergunta sobre as últimas 2 semanas |
| R.N. 005 | Acesso | O paciente só vê as próprias respostas, sem pontuação, faixa, gráfico ou frase de evolução. A tela final do questionário diz só "Suas respostas foram enviadas para a sua equipe" |
| R.N. 006 | Acesso | O psiquiatra só vê pacientes encaminhados a ele |
| R.N. 007 | Leitura da evolução | Só para profissionais. Faixas: 0 a 4 mínima, 5 a 9 leve, 10 a 14 moderada, 15 a 19 moderadamente grave, 20 a 27 grave. Resposta ao tratamento, comparando com a primeira resposta do acompanhamento e só a partir de 4 semanas: queda de 5 ou mais é adequada, de 2 a 4 é possivelmente inadequada, de 1 ou menos é inadequada; antes de 4 semanas, "cedo para avaliar" |
| R.N. 008 | Destaques da lista | Prioridade: Risco (R.N. 001); Piorou (a última pontuação está numa faixa acima da anterior); Sem resposta (7 dias depois da data prevista); Sugere encaminhamento (R.N. 003); Em dia. A lista agrupa pelo destaque mais alto, numa seção para cada um, e mostra os outros como texto na linha. Paciente com encaminhamento fica na seção Encaminhados. Destaque sempre com texto, nunca só cor |
| R.N. 009 | Lembrete | WhatsApp na data prevista e de novo 3 dias depois, só para quem tem celular no cadastro, com os botões "Responder aqui" e "Responder no site". O texto do lembrete não leva dado de saúde |
| R.N. 010 | Transferência | Qualquer profissional da mesma equipe transfere o acompanhamento para outro profissional da mesma equipe, ou redireciona um encaminhamento para outro psiquiatra. Motivo obrigatório. O histórico vai junto e a transferência fica registrada (quem, quando, motivo) |
| R.N. 011 | Contrarreferência | O encaminhamento passa por Novo, Visto (quando o psiquiatra abre) e Respondido (quando a orientação volta para a unidade). A consulta com o especialista é agendada pela regulação, fora do sistema. Conduta, medicação e quando reencaminhar são obrigatórios. O paciente continua sendo acompanhado pela unidade |

## Histórias de usuário

Formato: "Como um Papel, gostaria de Objetivo para Benefício".

| H.U. | Nome | Papel | Objetivo | Benefício | R.F. |
|---|---|---|---|---|---|
| 001 | Responder pelo WhatsApp | Paciente | responder o questionário numa conversa no WhatsApp, sem instalar nada | a equipe saber como estou sem eu ir ao posto nem gastar meu pacote de dados | 002 |
| 002 | Rever o que respondi | Paciente | rever as respostas que dei nas semanas anteriores | lembrar o que quero contar na próxima consulta | 003 |
| 003 | Saber quem precisa de atenção | Profissional da unidade | ver primeiro quem piorou, marcou risco ou parou de responder | fazer a busca ativa antes que o paciente abandone | 006 |
| 004 | Chegar preparado à consulta | Profissional da unidade | ver a evolução e o contexto do paciente antes da consulta | usar o pouco tempo da consulta para decidir, não para perguntar tudo de novo | 007 |
| 005 | Registrar quem não tem internet | Profissional da unidade | registrar as respostas do paciente na unidade ou na visita domiciliar | não deixar de fora quem não tem celular ou pacote de dados | 004 |
| 006 | Encaminhar com histórico | Profissional da unidade | encaminhar ao psiquiatra com o resumo gerado | o especialista receber a informação completa que a linha de cuidado pede | 008 |
| 007 | Receber o caso com histórico | Psiquiatra | ver a evolução medida do paciente encaminhado | não começar do zero numa consulta curta | 009 |
| 008 | Passar o paciente adiante | Profissional da unidade | transferir meus pacientes para um colega da equipe quando saio de férias ou deixo a unidade | o paciente não ficar sem responsável | 011 |
| 009 | Saber o que o especialista orientou | Profissional da unidade | ler a conduta e a medicação definidas pelo psiquiatra na ficha do paciente | continuar o cuidado sem depender de papel ou telefonema | 012 |

## Casos de uso

Fronteira: Entre Consultas.

| Relação | Elementos |
|---|---|
| Generalização de ator, nível 1 | Paciente ▷ Usuário; Profissional de saúde ▷ Usuário |
| Generalização de ator, nível 2 | Profissional da unidade ▷ Profissional de saúde; Psiquiatra ▷ Profissional de saúde |
| Associação | Usuário: Autenticar. Paciente: Responder questionário; Ver respostas anteriores; Receber lembrete do questionário. Profissional de saúde: Ver evolução do paciente. Profissional da unidade: Registrar respostas pelo paciente; Abrir acompanhamento; Encerrar acompanhamento; Listar pacientes acompanhados; Encaminhar ao especialista; Transferir paciente. Psiquiatra: Ver encaminhamentos recebidos; Responder encaminhamento |
| `<<include>>` | Abrir acompanhamento → Definir periodicidade; Encaminhar ao especialista → Gerar resumo do histórico |
| `<<extend>>` | Responder questionário → Alertar risco (só quando a pergunta 9 é positiva) |
| Generalização de caso de uso | WhatsApp ▷ Responder questionário; Site ▷ Responder questionário; Acompanhamento ▷ Transferir paciente; Encaminhamento ▷ Transferir paciente |

## Protótipo

Vite, React, TypeScript, Tailwind, shadcn/ui e Recharts. Dados fictícios, sem backend, roda local. Telas do paciente (site e WhatsApp) em 390 x 844; telas web em 1440 x 900.

### Identidade visual

Fonte Inter. Fundo cinza-claro com cartões brancos, no jeito dos apps de celular; o azul vem do padrão de governo (gov.br), para o sistema parecer serviço público e não app comercial.

| Uso | Cor |
|---|---|
| Principal (botões, links, linha do gráfico) | `#1351B4`, hover `#0C326F` |
| Fundo / cartão | `#F2F2F7` / `#FFFFFF` |
| Texto / texto secundário | `#1C1C1E` / `#6C6C70` |
| Destaque de seleção | fundo `#EAF0FA`, texto `#0C326F` |
| Risco e alerta do CVV | `#B3261E` |
| Faixas do PHQ-9 | Mínima `#1B7F3B`, Leve `#7A6400`, Moderada `#A35100`, Moderadamente grave `#C2410C`, Grave `#B3261E` |
| Conversa do WhatsApp | topo `#008069`, fundo `#EFEAE2`, balão do paciente `#D9FDD3` |

Toda cor de texto passa no contraste AA sobre o fundo em que aparece. Cor forte só no que pede ação (risco); a faixa aparece como um ponto colorido ao lado do nome em texto secundário.

A marca oficial do gov.br aparece só no botão "Entrar com gov.br" do login.

### Login

Um botão, "Entrar com gov.br", para os três perfis. No protótipo a etapa do gov.br não existe: o botão abre um menu para escolher quem entra (Ana no WhatsApp, Fernanda no site, Juliana ou Marcos), as mesmas visões da barra de demonstração. No sistema proposto, o CPF vindo do gov.br identifica o perfil e abre a tela dele.

### Conversa do WhatsApp

Rota `/whatsapp` com moldura de celular imitando o WhatsApp (contato "Entre Consultas", balões, botões e lista de opções). Imitação visual clicável, não o WhatsApp real.

1. Começa no lembrete (R.F. 010) com os botões "Responder aqui" e "Responder no site".
2. "Responder aqui" segue a conversa: uma pergunta do PHQ-9 por mensagem, lista com "Nenhuma vez", "Vários dias", "Mais da metade dos dias", "Quase todos os dias". Cada toque vira balão do paciente e traz a próxima pergunta.
3. Pergunta 9 diferente de "Nenhuma vez" manda a mensagem do CVV antes de seguir.
4. Estressores: lista com as 7 opções e "Nenhuma delas", depois "Mais algum?" com "Sim" e "Não, terminar".
5. Fim: "Suas respostas foram enviadas para a sua equipe".

O menu "Demonstração" reinicia a conversa.

### Dados fictícios

Unidade "UBS Bela Vista (fictícia)"; profissional "Enf. Juliana Costa"; psiquiatra "Dr. Marcos Lima". Oito pacientes, um para cada estado que a lista precisa mostrar:

| Paciente | Estado | Para mostrar |
|---|---|---|
| Maria | Risco: pergunta 9 positiva na última resposta, pelo WhatsApp | R.N. 001 |
| João | Piorou: de 9 para 16 | R.N. 008 |
| Ana | Sem resposta há 10 dias | R.N. 008, R.N. 009 |
| Carlos | Sugere encaminhamento: 18 semanas, de 17 para 15 | R.N. 003 |
| Fernanda | Em dia, melhorando: de 19 para 8; respostas pelo site | R.N. 007, R.F. 003 (conta de demonstração do paciente) |
| Paulo | Em dia, aberto há 2 semanas, "cedo para avaliar" | R.N. 007 |
| Luciana | Em dia, respostas registradas em visita domiciliar, sem celular | R.F. 004 |
| Roberto | Encaminhado ao Dr. Marcos | R.F. 008, R.F. 009 |

Na carteira do Dr. Rafael Souza, médico de família da mesma equipe, mais seis pacientes já encaminhados ao Dr. Marcos, para a lista do psiquiatra ter o que ordenar: Tereza (grave, pensamentos de se ferir nas três últimas respostas), Antônio (pensamento de se ferir pela primeira vez, em visita domiciliar), Diego, Marcelo, Patrícia e Rosângela (que melhorou depois do encaminhamento). Eles não aparecem na lista da Juliana.

### Início da equipe

A lista lateral é o resumo do dia: seções "Precisa de atenção", "Sem resposta", "Sugere encaminhamento", "Encaminhados" e "Em dia", cada paciente com nome, pontuação e faixa, os outros destaques em texto e o tempo relativo ("Respondeu há 2 dias, próxima em 12 dias"). Sem paciente aberto, a área ao lado mostra a data, quantos precisam de atenção e os questionários previstos para os próximos 7 dias. Setas do teclado trocam de paciente; o "+" ao lado da busca abre um acompanhamento.

### Tela R.F. 007: evolução do paciente

Precisa ser fácil de entender; na consulta, é esta tela que o profissional mostra ao paciente.

- Cabeçalho: nome, idade, responsável e uma frase com a tendência recente.
- Cartão "Agora": última pontuação, faixa, resposta ao tratamento em palavras e variação desde o início (ex.: "18 → 11, caiu 7"), semanas de acompanhamento e a leitura da pergunta 9 ("Presente há 4 semanas", "Ausente na última resposta").
- Gráfico de linha com eixo de 0 a 27 e as cinco faixas coloridas ao fundo, rotuladas; marcador de alerta nas respostas com pergunta 9 positiva; linha interrompida nos períodos sem resposta; o ponto escolhido aparece no topo do gráfico com data, pontuação, faixa e canal; período de 3 meses, 6 meses ou tudo. Embaixo do gráfico, um quadrado por resposta com a frequência da pergunta 9. Na tela, a pergunta 9 aparece como "pensamentos de se ferir".
- Lateral: acompanhamento (início, periodicidade, próximo questionário, histórico), encaminhamento com a situação e a orientação do psiquiatra (R.F. 012), estressores mais marcados nas últimas 4 respostas e contexto social do e-SUS.
- Botões: Registrar respostas, Encaminhar ao especialista e Transferir, que abrem painéis sobre a ficha. Encerrar acompanhamento fica no menu "Mais ações".

A equipe da unidade vê a pontuação, a faixa e a pergunta 9, não as respostas item a item.

### Tela R.F. 009: encaminhamentos e resumo do psiquiatra

Lista em tabela, em duas seções ("Para atender" e "Respondidos"): paciente, situação (ponto azul nos novos), última pontuação e faixa, motivo e quando chegou o encaminhamento. A ordem é pensamentos de se ferir na última resposta, depois a pontuação mais alta e, no empate, quem espera há mais tempo.

Resumo: o texto do encaminhamento, o cartão "Agora", o mesmo gráfico e a tabela "Respostas ao longo do tempo", com cada pergunta (de 0 a 3) e cada estressor numa linha por data. Um painel fixo à direita abre na última resposta e mostra as nove perguntas por extenso, a resposta, a mudança desde a anterior e os estressores; troca de resposta pelas setas, pelos pontos do gráfico ou pelas datas da tabela. O painel e a tabela vão além do R.F. 007 e foram aprovados na revisão das telas. Abrir o resumo marca o encaminhamento como visto; o botão "Responder à unidade" registra o R.F. 012.

### Boas práticas de UI

- Questionário do site com uma pergunta por tela e progresso ("3 de 9").
- Alvos de toque de pelo menos 44 px; contraste AA.
- Status sempre com texto além da cor; linguagem simples.
- Estado vazio nas listas; confirmação antes de encerrar e de transferir.
- O mesmo conjunto de componentes em todas as telas.
- Nenhuma tela do paciente mostra pontuação, faixa ou gráfico (R.N. 005).

### Prints

Script Playwright (`pnpm prints`) salva em `prints/`. Título no documento: "R.F. 0XX - Nome".

| Arquivo | Tela | Tamanho |
|---|---|---|
| 01-rf001-login.png | Login | web |
| 02-rf002-site-pergunta.png | Pergunta do PHQ-9 no site | celular |
| 03-rf002-site-estressores.png | Estressores no site | celular |
| 04-rf002-site-alerta-cvv.png | Alerta com CVV no site | celular |
| 05-rf002-whatsapp-pergunta.png | Pergunta com lista de opções aberta | celular |
| 06-rf002-whatsapp-estressores.png | Estressor escolhido e "Mais algum?" | celular |
| 07-rf002-whatsapp-alerta-cvv.png | Mensagem do CVV depois da pergunta 9 | celular |
| 08-rf003-respostas-anteriores.png | Respostas anteriores, sem pontuação | celular |
| 09-rf004-registrar-respostas.png | Registro pelo profissional | web |
| 10-rf005-abrir-acompanhamento.png | Abrir, com periodicidade | web |
| 11-rf005-encerrar-acompanhamento.png | Diálogo de encerramento | web |
| 12-rf006-lista.png | Lista com destaques | web |
| 13-rf007-evolucao.png | Evolução do paciente | web |
| 14-rf008-encaminhar.png | Encaminhamento com resumo | web |
| 15-rf009-encaminhamentos.png | Encaminhamentos recebidos | web |
| 16-rf009-resumo.png | Resumo do psiquiatra | web |
| 17-rf010-lembrete-whatsapp.png | Lembrete com os dois botões | celular |
| 18-rf011-transferir.png | Diálogo de transferência | web |
| 19-rf012-responder.png | Psiquiatra respondendo à unidade | web |
| 20-rf012-orientacao.png | Orientação do psiquiatra na ficha da unidade | web |

### Tecnologia do protótipo

**Stack.** Vite, React 19 e TypeScript; Tailwind 4 com componentes shadcn/ui; Recharts no gráfico de evolução; React Router nas rotas; React Hook Form com Zod nos formulários; Sonner nos avisos. Vitest testa as regras de domínio e Playwright gera os prints.

**Estado.** Sem backend. Os dados fictícios ficam em `src/dados/fixtures.ts` e a data de hoje é fixa em 27/11/2026, para estados e prints saírem iguais toda vez. Uma store Zustand guarda sessão, respostas, acompanhamentos, encaminhamentos e transferências no `localStorage`; o botão "Demonstração" troca de perfil e volta ao estado inicial. As regras (pontuação, faixas, destaques da lista, datas previstas, lembretes, lacunas, resumo do encaminhamento) ficam em `src/dominio`, sem React, com testes.

**Rotas.**

| Rota | Tela | Perfil |
|---|---|---|
| `/login` | Login com gov.br | nenhum |
| `/paciente` | Início do paciente | paciente |
| `/paciente/questionario?passo=1..9, alerta, estressores, fim` | Questionário no site | paciente |
| `/paciente/respostas` e `/paciente/respostas/:id` | Respostas anteriores e uma resposta | paciente |
| `/whatsapp?passo=lembrete, pergunta-N, alerta, estressores, mais, fim` | Conversa do WhatsApp da Ana | nenhum |
| `/equipe` | Lista de pacientes | profissional |
| `/equipe/abrir` | Abrir acompanhamento (painel) | profissional |
| `/equipe/pacientes/:id` (`?dialogo=encerrar` ou `transferir`) | Evolução, encerramento e transferência | profissional |
| `/equipe/pacientes/:id/registrar` | Registrar respostas (painel sobre a ficha) | profissional |
| `/equipe/pacientes/:id/encaminhar` | Encaminhar ao especialista (painel sobre a ficha) | profissional |
| `/psiquiatra` | Encaminhamentos recebidos | psiquiatra |
| `/psiquiatra/encaminhamentos/:id` | Resumo do psiquiatra | psiquiatra |

Cada passo intermediário abre direto pela URL e preenche respostas anteriores de exemplo, para a tela fazer sentido sozinha.

**Prints.** `pnpm prints` builda o projeto, sobe o `vite preview`, injeta a sessão de cada perfil no `localStorage`, abre a tela de cada print com `?print=1` (esconde o botão de demonstração e mostra a barra de status do celular) e salva em `prints/`. Em cada tela roda o axe e falha se houver contraste abaixo de AA.

## Matriz de rastreabilidade

Toda tela existe por um R.F.; nada fora desta lista.

| R.F. | Caso(s) de uso | H.U. | Prints |
|---|---|---|---|
| 001 | Autenticar | | 01 |
| 002 | Responder questionário; WhatsApp; Site; Alertar risco | 001 | 02 a 07 |
| 003 | Ver respostas anteriores | 002 | 08 |
| 004 | Registrar respostas pelo paciente | 005 | 09 |
| 005 | Abrir acompanhamento; Definir periodicidade; Encerrar acompanhamento | | 10, 11 |
| 006 | Listar pacientes acompanhados | 003 | 12 |
| 007 | Ver evolução do paciente | 004 | 13 |
| 008 | Encaminhar ao especialista; Gerar resumo do histórico | 006 | 14 |
| 009 | Ver encaminhamentos recebidos | 007 | 15, 16 |
| 010 | Receber lembrete do questionário | | 17 |
| 011 | Transferir paciente; Acompanhamento; Encaminhamento | 008 | 18 |
| 012 | Responder encaminhamento | 009 | 19, 20 |
